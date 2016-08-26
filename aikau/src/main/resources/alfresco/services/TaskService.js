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
 * @module alfresco/services/TaskService
 * @extends module:alfresco/services/BaseService
 * @mixes module:alfresco/core/CoreXhr
 * @author Dave Draper
 * @since 1.0.NEXT
 */
define(["dojo/_base/declare",
        "alfresco/services/BaseService",
        "alfresco/core/CoreXhr",
        "alfresco/core/topics",
        "dojo/_base/lang",
        "service/constants/Default"],
        function(declare, BaseService, CoreXhr, topics, lang, AlfConstants) {
   
   return declare([BaseService, CoreXhr], {
      
      /**
       * Sets up the subscriptions for the TaskService
       * 
       * @instance 
       * @listens module:alfresco/core/topics#GET_TASKS
       */
      registerSubscriptions: function alfresco_services_TaskService__registerSubscriptions() {
         this.alfSubscribe(topics.GET_TASKS, lang.hitch(this, this.onTasksRequest));
      },
      
      /**
       * 
       * @instance
       * @param {object} payload The payload containing the details of the task parameters
       */
      onTasksRequest: function alfresco_services_TaskService__onTasksRequest(payload) {

         var url = AlfConstants.PROXY_URI + "/api/task-instances";
         var options = {
            authority: AlfConstants.USERNAME,
            properties: "bpm_priority,bpm_status,bpm_dueDate,bpm_description",
            exclude: "wcmwf:*",
            state: payload.state,
            pooledTasks: (payload.pooledTasks === "true"),
            dueAfter: payload.dueAfter,
            dueBefore: payload.dueBefore,
            priority: (typeof payload.priority !== "undefined") ? payload.priority : null
         };

         // TODO: Pagination convertion...

         if (url !== null)
         {
            this.serviceXhr({url: url,
                             query: options,
                             alfTopic: payload.alfResponseTopic || null,
                             alfResponseScope: payload.alfResponseScope,
                             method: "GET"});
         }
      }
   });
});
