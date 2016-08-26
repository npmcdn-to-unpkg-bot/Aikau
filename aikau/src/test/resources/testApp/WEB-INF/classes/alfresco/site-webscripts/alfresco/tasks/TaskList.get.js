model.jsonModel = {
   services: [
      {
         name: "alfresco/services/LoggingService",
         config: {
            loggingPreferences: {
               enabled: true,
               all: true,
               warn: true,
               error: true
            }
         }
      },
      "alfresco/services/TaskService"
   ],
   widgets: [
      {
         name: "alfresco/tasks/TaskList",
         config: {
            
         }
      },
      {
         name: "alfresco/logging/DebugLog"
      }
   ]
};