import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import { TimeSync } from 'meteor/mizzao:timesync';
import { UserPresence } from 'meteor/konecty:user-presence';
import toastr from 'toastr';
import hljs from 'highlight.js';

import { fireGlobalEvent } from '../../app/ui-utils';
import { settings } from '../../app/settings';
import { Users } from '../../app/models';
import { getUserPreference } from '../../app/utils';
import 'highlight.js/styles/github.css';

hljs.initHighlightingOnLoad();

if (window.DISABLE_ANIMATION) {
	toastr.options.timeOut = 1;
	toastr.options.showDuration = 0;
	toastr.options.hideDuration = 0;
	toastr.options.extendedTimeOut = 0;
  }

  Meteor.startup(function() {
	TimeSync.loggingEnabled = false;

	Session.setDefault('AvatarRandom', 0);

	window.lastMessageWindow = {};
	window.lastMessageWindowHistory = {};

	Tracker.autorun(function(computation) {
		if (!Meteor.userId() && !settings.get('Accounts_AllowAnonymousRead')) {
			return;
		}
		Meteor.subscribe('userData');
		computation.stop();
	});

	let status = undefined;
	Tracker.autorun(function() {
	  if (!Meteor.userId()) {
		return;
	  }
	  const user = Users.findOne(Meteor.userId(), {
		fields: {
		  status: 1,
		  'settings.preferences.idleTimeLimit': 1,
		  'settings.preferences.enableAutoAway': 1,
		},
	  });

	  if (!user) {
		return;
	  }

	  if (getUserPreference(user, 'enableAutoAway')) {
		const idleTimeLimit = getUserPreference(user, 'idleTimeLimit') || 300;
		UserPresence.awayTime = idleTimeLimit * 1000;
	  } else {
		delete UserPresence.awayTime;
		UserPresence.stopTimer();
	  }

	  UserPresence.start();

	  if (user.status !== status) {
		status = user.status;
		fireGlobalEvent('status-changed', status);
	  }

	  window.console.log(window.Meteor.user());


	  if (window.Meteor.user().roles) {
		window.pendo.initialize({
		  visitor: {
			id: window.Meteor.user().emails[0].address, // Required if user is logged in
			email: window.Meteor.user().emails[0].address, // Optional
			username: window.Meteor.user().username,
			roles: window.Meteor.user().roles,
			full_name: Meteor.user().name,
			tags: [Meteor.user().roles]
		},
		account:{
			id: window.Meteor.settings.Site_Name,
			SiteUrl: window.Meteor.settings.Site_Url,
			UserLimit: window.Meteor.settings.API_User_Limit
		}
		});
	  }

	  window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
		pendo.track('Error', {
		  message: errorMsg,
		  url: url,
		  line: lineNumber,
		  column: column,
		  error: errorObj
		});
		console.log("error sent to pendo")
	  }

	  if (!window.PerformanceObserver) return;

	  var metricQueue = [];
	  var observer = new window.PerformanceObserver(function(list) {
		var entries = list.getEntries();
		var i, name, type, entry, eventName, metric, time, route;

		url = window.location.pathname;
		for (i = 0; i < entries.length; i++) {
		  entry = entries[i];
		  name = entry.name;
		  type = entry.entryType;
		  time = null;
		  if (name === 'first-contentful-paint' || name === 'first-meaningful-paint') {
			time = entry.startTime;
			eventName = name;
		  } else if (type === 'longtask' && entry.duration > 500) {
			time = entry.duration;
			eventName = type + '_over500';
		  }
		  if (time != null) {
			metricQueue.push({
			  eventName: eventName,
			  time: Math.round(time),
			  type: '__pendo__performance',
			  route: route
			});
		  }
		}
		if (!window.pendo || !window.pendo.track || typeof window.pendo.track !== 'function') {
		  if (metricQueue.length > 25) {
			metricQueue.length = 0;
		  }
		  return;
		}
		for (i = 0; i < metricQueue.length; i++) {
		  metric = metricQueue[i];
		  eventName = metric.eventName;
		  delete metric.eventName;
		  window.pendo.track(eventName, metric);
		}
		metricQueue.length = 0;
	  });
	  observer.observe({
		entryTypes: ['paint', 'mark', 'longtask']
	  });



	});
  });
