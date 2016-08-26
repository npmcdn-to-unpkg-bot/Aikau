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
 *
 * @module alfresco/tasks/TaskList
 * @extends module:alfresco/lists/AlfFilteredList
 * @author Dave Draper
 * @since 1.0.NEXT
 */
define(["dojo/_base/declare",
        "alfresco/lists/AlfFilteredList",
        "alfresco/core/JsNode",
        "alfresco/core/topics",
        "dojo/_base/array",
        "dojo/_base/lang",
        "alfresco/util/hashUtils",
        "dojo/io-query",
        "dojo/dom-class"],
        function(declare, AlfFilteredList, JsNode, topics, array, lang, hashUtils, ioQuery, domClass) {

   return declare([AlfFilteredList], {

      /**
       * An array of the i18n files to use with this widget.
       *
       * @instance
       * @type {object[]}
       * @default [{i18nFile: "./i18n/TaskList.properties"}]
       */
      i18nRequirements: [{i18nFile: "./i18n/TaskList.properties"}],

      /**
       * @instance
       * @type {object}
       * @default
       */
      currentFilter: null,

      /**
       * Overrides the [inherited default]{@link module:alfresco/lists/AlfHashList#updateInstanceValues}
       * to ensure that instance values should be updated from the hash. This only appliees when
       * [useHash]{@link module:alfresco/lists/AlfHashList#useHash} is configured to be true.
       *
       * @instance
       * @type {boolean}
       * @default
       */
      updateInstanceValues: true,

      /**
       * Extends the [inherited function]{@link module:alfresco/lists/AlfSortablePaginatedListt#postMixInProperties}
       * to set a default filter to be a root path.
       *
       * @instance
       */
      postMixInProperties: function alfresco_tasks_TaskList__postMixInProperties() {
         this.inherited(arguments);

         if (this.useHash === true)
         {
            // Push the core hash update variables into the array configured by the extended AlfSortablePaginatedList
            this._coreHashVars.push("filter");
         }

         if (!this.currentFilter)
         {
            this.currentFilter = {
               path: "/"
            };
         }
      },

      /**
       * Run after widget created
       *
       * @instance
       * @override
       */
      postCreate: function alfresco_tasks_TaskList__postCreate() {
         this.inherited(arguments);
         domClass.add(this.domNode, "alfresco-tasks-TaskList");
      },

      /**
       * This function sets up the subscriptions that the Document List relies upon to manage its
       * internal state and request documents.
       *
       * @instance
       * @listens ALF_DOCUMENTLIST_PATH_CHANGED
       * @listens ALF_DOCUMENTLIST_CATEGORY_CHANGED
       * @listens module:alfresco/core/topics#DOCUMENTLIST_TAG_CHANGED
       * @listens filterSelectionTopic
       * @listens documentSelectionTopic
       * @listens parentNavTopic
       */
      setupSubscriptions: function alfresco_tasks_TaskList__setupSubscriptions() {
         this.inherited(arguments);
         this.alfSubscribe(this.filterSelectionTopic, lang.hitch(this, this.onFilterChanged));
      },

      /**
       *
       *
       * @instance
       * @param {object} payload The details of the changed filter
       * @fires ALF_NAVIGATE_TO_PAGE
       */
      onFilterChanged: function alfresco_tasks_TaskList__onFilterChanged(payload) {
         if (payload.value)
         {
            // Clear any old data when infinite scroll is enabled (see AKU-358)
            this.useInfiniteScroll && this.clearViews();

            if (this.useHash === true)
            {
               var currHash = hashUtils.getHash();
               currHash.filter = payload.value;
               currHash.currentPage = 1;
               delete currHash.category;
               delete currHash.path;
               delete currHash.tag;
               this.alfPublish("ALF_NAVIGATE_TO_PAGE", {
                  url: ioQuery.objectToQuery(currHash),
                  type: "HASH"
               }, true);
            }
            else
            {
               this.currentPage = 1;
               this.currentFilter = {
                  filter: payload.value
               };
               this.loadData();
            }
         }
         else
         {
            this.alfLog("warn", "A request was made to change the filter for a Document List, but no 'value' attribute was provided", payload, this);
         }
      },

      /**
       * Checks the hash for updates relating to pagination and sorting.
       *
       * @instance
       * @param {object} hashParameters An object containing the current hash parameters
       */
      _updateCoreHashVars: function alfresco_tasks_TaskList___updateCoreHashVars(hashParameters) {
         this.inherited(arguments);
         this.currentFilter = hashParameters;
      },

      /**
       * Extends the [inherited function]{@link module:alfresco/lists/AlfSortablePaginatedList#updateLoadDataPayload} to
       * add the additional document library related data.
       *
       * @instance
       * @param {object} payload The payload object to update
       */
      updateLoadDataPayload: function alfresco_tasks_TaskList__updateLoadDataPayload(payload) {
         this.inherited(arguments);

         var type = "all";
         if (this.showFolders === false && this.showDocuments === false)
         {
            // Someone has been silly...
            this.alfLog("warn", "An AlfDocumentList has been configured to neither show folders nor documents, so showing both", this);
         }
         else if (this.showFolders === false)
         {
            type = "documents";
         }
         else if (this.showDocuments === false)
         {
            type = "folders";
         }

         payload.type = type;
         payload.site = this.siteId;
         payload.container = this.containerId;
         payload.filter = this.currentFilter;
         payload.libraryRoot = this.rootNode;
         payload.rawData = this.rawData;

         if (!this.siteId && this.nodeRef)
         {
            // Repository mode (don't resolve Site-based folders)
            payload.nodeRef = this.nodeRef.toString();
         }
      },

      /**
       * This is an extension point function for extending modules to perform processing on the loaded
       * data once it's existence has been verified
       *
       * @instance
       * @param {object} response The original response.
       */
      processLoadedData: function alfresco_tasks_TaskList__processLoadedData(response) {
         array.forEach(this.currentData, function(item) {
            item.jsNode = new JsNode(item.node);
         }, this);

         // Publish the details of the metadata returned from the data request...
         if (response.metadata)
         {
            this.alfPublish(this.metadataChangeTopic, {
               node: response.metadata
            });

            // Publish the details of the permissions for the current user. This will
            // only be available when the a specific node is shown rather than a set
            // of results across multiple nodes (e.g. the result of a filter request)
            if (response.metadata.parent &&
                response.metadata.parent.permissions &&
                response.metadata.parent.permissions.user)
            {
               this.alfPublish(this.userAccessChangeTopic, {
                  userAccess: response.metadata.parent.permissions.user
               });
            }
         }
         this.inherited(arguments);
      },


      /**
       * Overrides the [default filters]{@link module:alfresco/lists/AlfFilteredList#widgetsForFilters} as 
       * there should be no filters for document lists unless explicitly configured.
       *
       * @instance
       * @type {object[]}
       * @default
       */
      widgetsForFilters: null
   });
});
