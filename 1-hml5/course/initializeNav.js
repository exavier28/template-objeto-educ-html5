//udutu api (initialize_top) interface layer
var findAPITries = 0;
var CVF_API;
function findCVF_API(win)
{
   // Check to see if the window (win) contains the API
   // if the window (win) does not contain the API and
   // the window (win) has a parent window and the parent window
   // is not the same as the window (win)
   while ( (win.CVF_API == null) &&
           (win.parent != null) &&
           (win.parent != win) )
   {
      // increment the number of findAPITries
      findAPITries++;
      // Note: 7 is an arbitrary number, but should be more than sufficient
      if (findAPITries > 7)
      {
         alert("Error finding CVF_API -- too deeply nested.");
         return null;
      }

      // set the variable that represents the window being
      // being searched to be the parent of the current window
      // then search for the API again
      win = win.parent;
   }
   return win.CVF_API;
}
function getCVF_API()
{
   // start by looking for the API in the current window
   var theAPI = findCVF_API(window);
   // if the API is null (could not be found in the current window)
   // and the current window has an opener window
   if ( (theAPI == null) &&
        (window.opener != null) &&
        (typeof(window.opener) != "undefined") )
   {

      // try to find the API in the current window's opener
      theAPI = findCVF_API(window.opener);
   }
   // if the API has not been found
   if (theAPI == null)
   {
      // Alert the user that the API Adapter could not be found
      alert("Unable to find CVF_API");
   }

   return theAPI;
}



   function initializeNav() //generic initialization used by most nav templates 
{ 
//var gblThemeDir;  //(not needed here - bring in from top frame, send to studentview iframe) 
CVF_API = getCVF_API();


CVF_API.gblNavFrame = getObjByName('NavFrame',CVF_API.document); 

CVF_API.gblNavDocument = document; 

CVF_API.gblNextButton = new CVF_API.initButton(next_up, next_over, next_disabled, 'btnNext', parent.goNextPage,'Next page','This is the last page of the course'); 

CVF_API.gblPreviousButton = new CVF_API.initButton(previous_up, previous_over, previous_disabled, 'btnPrevious', parent.goPreviousPage,'Previous page','This is the first page of the course'); 

CVF_API.gblExitButton = new CVF_API.initButton(exit_up, exit_over, exit_up, 'btnExit', parent.doExit,'Close and Exit','You may not Exit at this time.'); 

CVF_API.gblCourseMapButton = new CVF_API.initButton(coursemap_up, coursemap_over, coursemap_disabled, 'btnCourseMap', parent.openCourseMap,'Course Map','The Course Map is disabled until the Interaction has been completed.'); 

CVF_API.gblGlossaryButton = new CVF_API.initButton(glossary_up, glossary_over, glossary_up, 'btnGlossary', parent.openGlossary,'Glossary','The Glossary is currently disabled.'); 

CVF_API.gblSearchButton = new CVF_API.initButton(search_up, search_over, search_up, 'btnSearch', parent.openSearch,'Search the Course for keywords','Search is disabled until the Interaction has been completed.'); 


CVF_API.gblReplayButton = new CVF_API.initButton(replay_up, replay_over, replay_disabled, 'btnReplay', parent.doReplay,'Refresh this screen','This is the last page of the course'); 


CVF_API.gblMainMenuButton = new CVF_API.initButton(home_up, home_over, home_disabled, 'btnHome', parent.goMainMenu,'Main Menu','The Main Menu is disabled until the Interaction has been completed.'); 

if (typeof( window[ 'resources_up' ] ) != "undefined"){
CVF_API.gblResourcesButton = new CVF_API.initButton(resources_up, resources_over, resources_disabled, 'btnResources', parent.goResources,'Resources','Resources are disabled until the Interaction has been completed.'); 
}
CVF_API.gblFAQButton = new CVF_API.initButton(faq_up, faq_over, faq_up, 'btnFAQ', parent.openFAQ,'FAQ','The FAQ is currently disabled.'); 
CVF_API.gblHelpButton = new CVF_API.initButton(help_up, help_over, help_up, 'btnHelp', parent.openFAQ,'Help','The Help is currently disabled.');
CVF_API.gblGuideButton = new CVF_API.initButton(guide_up, guide_over, guide_up, 'btnGuide', parent.openGuide,'Open the Guide','The Guide is currently unavailable.');

CVF_API.gblPrintButton = new CVF_API.initButton(print_up, print_over, print_up, 'btnPrint', parent.printScreen,'Print this screen','Print is not supported for this screen.');
CVF_API.gblMuteButton = new CVF_API.initButton(mute_up, mute_over, mute_up, 'btnMute', parent.toggleSound, 'Toggle Sound','Toggle Sound');

CVF_API.gblBreadCrumbLabel = new CVF_API.initLabel('lblBreadCrumb'); 
CVF_API.gblCourseLabel = new CVF_API.initLabel('lblCourseName'); 
CVF_API.gblModuleLabel = new CVF_API.initLabel('lblModuleName'); 
CVF_API.gblTopicLabel = new CVF_API.initLabel('lblTopicName'); 
CVF_API.gblScreenLabel = new CVF_API.initLabel('lblScreenName'); 
CVF_API.gblCurrentPageLabel = new CVF_API.initLabel('lblCurrentPage'); 
CVF_API.gblNumPagesLabel = new CVF_API.initLabel('lblLastPage'); 

CVF_API.gblScreenFrame = getObjByName('frameScreen',document); 
CVF_API.gblScreenFrameWidth = CVF_API.gblScreenFrame.width;
CVF_API.gblScreenFrameHeight = CVF_API.gblScreenFrame.height;

if ((CVF_API.gblMainMenuURL == '' || CVF_API.gblMainMenuURL == null) && CVF_API.gblHomeScreenID < 1)
{
    if (CVF_API.gblMainMenuButton != null && CVF_API.gblMainMenuButton.image != null)
    {
      CVF_API.gblMainMenuButton.image.style.width = 0;
    }
}

if (CVF_API.gblResourcesScreenID < 1)
{
  try{
   CVF_API.gblResourcesButton.image.style.width = 0;
   }catch(ex){}
}

if (CVF_API.gblScreens.length > 0)
    CVF_API.initializeStudentView(); 
} 