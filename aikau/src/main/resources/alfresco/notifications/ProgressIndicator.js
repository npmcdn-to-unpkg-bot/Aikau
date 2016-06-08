/**
 * Copyright (C) 2005-2016 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * A progress indicator.
 *
 * @module alfresco/notifications/ProgressIndicator
 * @author Martin Doyle
 * @since 1.0.71
 */
define(["alfresco/core/Core",
        "alfresco/core/topics",
        "alfresco/core/CoreWidgetProcessing",
        "alfresco/enums/urlTypes",
        "alfresco/util/urlUtils", 
        "dojo/_base/array",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/Deferred",
        "dojo/dom-class",
        "dojo/dom-style",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetBase",
        "dijit/registry",
        "dojo/text!./templates/ProgressIndicator.html"],
        function(AlfCore, topics, CoreWidgetProcessing, urlTypes, urlUtils, array, declare, lang, Deferred, domClass,
            domStyle, _TemplatedMixin, _WidgetBase, registry, template) {

   return declare([_WidgetBase, _TemplatedMixin, AlfCore, CoreWidgetProcessing], {

      /**
       * An array of the CSS files to use with this widget.
       *
       * @instance cssRequirements {Array}
       * @type {object[]}
       * @default [{cssFile:"./css/ProgressIndicator.css"}]
       */
      cssRequirements: [{
         cssFile: "./css/ProgressIndicator.css"
      }],

      /**
       * An array of the i18n files to use with this widget.
       * 
       * @instance
       * @type {object[]}
       * @default [{i18nFile: "./i18n/ProgressIndicator.properties"}]
       */
      i18nRequirements: [{
         i18nFile: "./i18n/ProgressIndicator.properties"
      }],

      /**
       * The HTML template to use for the widget.
       *
       * @instance
       * @type {String}
       */
      templateString: template,

      /**
       * The base CSS class for the widget
       *
       * @instance
       * @type {string}
       * @default
       */
      baseClass: "alfresco-notifications-ProgressIndicator",

      /**
       * How many milliseconds to wait before destroying this widget after the indicator has been hidden
       *
       * @instance
       * @type {number}
       * @default
       */
      destroyAfterHideMs: 0,

      /**
       * Variable to hold the Deferred object that will resolve once this notification is destroyed
       *
       * @type {object}
       */
      destroyDeferred: null,

      /**
       * The notification ID (helps with customisation)
       *
       * @instance
       * @type {String}
       * @default
       */
      id: null,

      /**
       * The loading message text
       *
       * @instance
       * @type {string}
       * @default
       */
      loadingMessage: "progress-indicator.loading-message",

      /**
       * The src for the loading animation image
       *
       * @instance
       * @type {string}
       * @default
       */
      loadingLogoSrc: "alfresco/notifications/css/images/ani_ring_fff-on-666.gif",

      /**
       * The scrollbar width for this browser-environment
       *
       * @instance
       * @type {number}
       * @default
       */
      _scrollbarWidth: null,

      /**
       * This is run after the properties have been mixed in, but before the
       * widget is created.
       *
       * @instance
       * @override
       */
      postMixInProperties: function alfresco_notifications_ProgressIndicator__postMixInProperties() {
         if (!this.id || registry.byId(this.id)) {
            this.id = this.generateUuid();
         }
         this.loadingMessage = this.message(this.loadingMessage);
         this.loadingLogoSrc = urlUtils.convertUrl(this.loadingLogoSrc, urlTypes.REQUIRE_PATH);
         this.inherited(arguments);
      },

      /**
       * Called after widget created, but not sub-widgets
       *
       * @instance
       * @override
       */
      postCreate: function alfresco_notifications_ProgressIndicator__postCreate() {
         this.inherited(arguments);
         document.body.appendChild(this.domNode);
      },

      /**
       * Called when widget is destroyed
       *
       * @instance
       * @override
       */
      destroy: function alfresco_notifications_AlfNotification__destroy() {
         this.destroyDeferred.resolve();
         this.inherited(arguments);
      },

      /**
       * Get the scrollbar width for the current browser environment. This is cached
       * after first retrieval for faster access.
       *
       * @instance
       * @returns {number} The scrollbar width
       */
      _getScrollbarWidth: function alfresco_services_DialogService___getScrollbarWidth() {
         if (!this._scrollbarWidth) {
            this._scrollbarWidth = window.innerWidth - document.documentElement.offsetWidth;
         }
         return this._scrollbarWidth;
      },

      /**
       * Hide the progress indicator (and destroy it)
       *
       * @instance
       * @private
       * @returns {Object} A promise that will be resolved when this widget has been destroyed
       */
      hide: function alfresco_notifications_ProgressIndicator___hide() {
         if (this.domNode && document.body.contains(this.domNode.parentNode)) {
            domStyle.set(document.body, "margin-right", "0");
            domClass.remove(document.documentElement, this.baseClass + "--displayed");
            setTimeout(function() {
               this.destroy();
            }.bind(this), this.destroyAfterHideMs);
         }
         return this.destroyDeferred.promise;
      },

      /**
       * Handle clicks on the close button.
       *
       * @instance
       * @param {Object} evt The Dojo-normalised event object
       */
      onCloseClick: function alfresco_notifications_ProgressIndicator__onCloseClick( /*jshint unused:false*/ evt) {
         this.alfServicePublish(topics.PROGRESS_INDICATOR_REMOVE_ALL_ACTIVITIES);
         this.alfLog("warn", "Progress indicator manually closed");
      },

      /**
       * Show the progress indicator.
       *
       * @instance
       * @override
       */
      show: function alfresco_notifications_ProgressIndicator__show() {
         this.destroyDeferred = new Deferred();
         domStyle.set(document.body, "margin-right", this._getScrollbarWidth() + "px");
         setTimeout(function() {
            domClass.add(document.documentElement, this.baseClass + "--displayed");
         }.bind(this)); // Add to page before showing, else transition fails
      }
   });
});