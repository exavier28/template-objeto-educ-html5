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
CVF_API=getCVF_API();


function ScreenClicked(intScreenID)
{
  CVF_API.goScreen(intScreenID);
  RenderCourseMap(null);
  if (window == window.top)
  	window.close();
}

function InitializeMap()
{  
  InitializeLabels();;
  RenderCourseMap(null); //RenderCourseMap(CVF_API.getModuleByScreenID(CVF_API.getCurrScreen().id).id);
}
 

function InitializeLabels()
{
  var lblCurrPageNumber = getObjByName('lblCurrentPageNumber',document);
  var lblCurrCourse = getObjByName('lblCurrentCourse',document);
  var lblCurrModule = getObjByName('lblCurrentModule',document);
  //var lblCurrTopic = getObjByName('lblCurrentTopic',document);
  var lblCurrScreen = getObjByName('lblCurrentScreen',document);

  var currScreen = CVF_API.getCurrScreen();
  
  lblCurrPageNumber.innerHTML = currScreen.pageNumber;
  lblCurrCourse.innerHTML = CVF_API.gblCourse.name;
  
  var rootModule = getRootModule(currScreen);
  if (rootModule.parentModule != null)
  {
    lblCurrModule.innerHTML = ' - ' + rootModule.name;
  }
  //lblCurrTopic.innerHTML = currScreen.topic.name;
  lblCurrScreen.innerHTML = currScreen.name;

}
function getRootModule(scrn)
{ 
  var grandParent = scrn.parentModule.parentModule;
  
  var parent = scrn.parentModule;
  while (grandParent != null)
  {
    if (grandParent.parentModule != null)
        parent = grandParent;
    grandParent = grandParent.parentModule;
  }
  return parent;
}


/*
function initLabel(lblID)
{
    this.lblID = lblID;
    this.label = getObjByName(lblID,gblNavDocument);
    this.setText = setText;
}
function setText(strText)
{
    try{
        this.label.innerHTML = strText;
    }
    catch(e){}
}
function initLabels()
{
    
    var currScreen;

    currScreen = CVF_API.getCurrScreen();
    gblCurrentPageLabel.setText(currScreen.pageNumber);
    gblNumPagesLabel.setText(CVF_API.gblScreens[CVF_API.gblScreens.length - 1].pageNumber);

    gblCourseLabel.setText(CVF_API.gblCourse.name);
    //gblModuleLabel.setText(currScreen.topic.module.name);
    //gblTopicLabel.setText(currScreen.topic.name);
    gblScreenLabel.setText(currScreen.name);

    if (gblBreadCrumbLabel != null)
    {
	var parent = currScreen.parentModule;
	var strBreadCrumb = parent.name;
	parent = parent.parentModule;
	while (parent != null)
	{
	  strBreadCrumb = parent.name + ' - ' + strBreadCrumb;
	  parent = parent.parentModule;
	}
	gblBreadCrumbLabel.setText(strBreadCrumb);
    }
}*/

function GetViewedTag(oItem, bSelected)
{
    var bCompleted = false;
    
    switch (oItem.type) {
        case 'module' : bCompleted = CVF_API.evaluateModuleCompletion(oItem);//oItem.completed;
                        break;
        case 'screen' : bCompleted = oItem.isCompleted();
                        break;
    }
        
    var sHTML = '<img id="imgVisited_' + oItem.id + '" src="' + CVF_API.gblDefaultDir + '{0}.gif" />';
    
    return ( bCompleted ) ? formatString(sHTML,['viewed']) : formatString(sHTML,['spacer']);        
    //return formatString(sHTML,['spacer']);
}

var gblInnerHTML = "";
var gblHeaderRendered = false;
var intPageCount = 1;
var tmpCurrScreen;
function RenderSideNav()
{
  RenderCourseMap(null);
  tmpCurrScreen = CVF_API.getCurrScreen();
  window.setTimeout('updateSideNav();',1000);
}

function updateSideNav()
{
  var tmpCurrScreen2 = CVF_API.getCurrScreen();
  if (tmpCurrScreen2.id != tmpCurrScreen.id)
  {
    RenderCourseMap(null);
    tmpCurrScreen = CVF_API.getCurrScreen();
  }
  window.setTimeout('updateSideNav();',1000);
}


function RenderCourseMap(intModuleId)
{
    gblInnerHTML = "";
    //var intPageCount = 1;
    var oCurrScreen = CVF_API.getCurrScreen();    
    //var oModules = CVF_API.gblModules;
    var bShowPreassessments = CVF_API.gblShowTopicPreassessments;
    var bLinearCourseMap = (CVF_API.gblCourseMapStyle == 'linear');
    //var bLinearCourseMap = true;
    
    //get the module for the current screen
    var oCurrScreenModule = oCurrScreen.parentModule;
    //get the root module
    var oModules = oCurrScreenModule;
    
    if(oModules != null)
    {
        bRootFound = false;
        while(!bRootFound)
        {
            if(oModules.parentModule == null)
            {
                bRootFound = true;
            }
            else
            {
                oModules = oModules.parentModule;
            }               
        }
    }
    
    // build the table
    //var span = getObjByName('spnContent');
    

    if (bLinearCourseMap) 
    {
        RenderModuleLinear(oModules);
    }
    else
    {
        if(intModuleId == null)
        {
            var oCurrScreen = CVF_API.getCurrScreen();
            var root = getRootModule(oCurrScreen);
            intModuleId = oCurrScreen.parentModule.id;
            //intModuleId = root.id;
        }
        RenderModuleTree(oModules, intModuleId);
    }
           
    
    var span = getObjByName('spnContent');
    //------> ------> ------> ------> ------> ------> ------> alert(gblInnerHTML);
    span.innerHTML = "<div style='height: 425px; overflow-y: scroll;'>" + gblInnerHTML + "</div>";
    
    //scroll to the top of the page
    document.location.hash = '#top';

}

function RenderModuleLinear(mod)
{
    var modName = mod.name;
    var bShowPreassessments = CVF_API.gblShowTopicPreassessments;
    var bLinearCourseMap = (CVF_API.gblCourseMapStyle == 'linear');
    //var bLinearCourseMap = true;
   // var span = getObjByName('spnContent');
    var sURHereImg = '<img src="' + CVF_API.gblDefaultDir + 'u_r_here.gif" style="visibility:{0}" width="22" height="22" alt="you are here">';
    var oCurrScreen = CVF_API.getCurrScreen();
    
    if(mod.moduleObjects != null && mod.moduleObjects.length > 0)
    {
        if(!gblHeaderRendered)
        {
            gblHeaderRendered = true;
        }
        
        if (mod.moduleType == 'Scenario' || mod.moduleType == 'NoBookmarkScenario')
        {
                    //show screen details
                    
                    var oScreen = CVF_API.getLastVisitedScenarioScreenInModule(mod);
                    //var bIsPreassessment = oScreen.topicPreassessment;
                    var sURHereScreenImg = formatString(sURHereImg, [(oCurrScreen.id == oScreen.id) ? 'visible' : 'hidden']);
                    
                    
                    // do not render preassessments if bShowPreassessments is false
                    //glossary_coursemap_middleMiddle.gif
                    //if ((bShowPreassessments && bIsPreassessment) || !bIsPreassessment) { 
                        /*gblInnerHTML += '<tr>';
                        gblInnerHTML += '<td style="background-color:Transparent;width:22px;">' + sURHereScreenImg + '</td>';
                        gblInnerHTML += '<td align="Center" class="{0}">';
                        gblInnerHTML += '<span id="lblCount_' + oScreen.id + 
                                      '">' + ((oScreen.pageNumber=='--') ? '--' : oScreen.pageNumber + '.') + '</span>';
                        gblInnerHTML += '</td>';
                        gblInnerHTML += '<td class="{0}"><span id="lblTopicName_' + oScreen.id;
                        gblInnerHTML += '">' + modName + '</span>';
                        gblInnerHTML += '</td>';
                        gblInnerHTML += '<td class="{0}">';
                        gblInnerHTML += '<a id="lnkScreenSelect_' + oScreen.id + 
                                    '" title="Go to this screen" href="javascript:ScreenClicked(' + oScreen.id + 
                                    ')" class="screenLink">' + oScreen.name + ' </a>'+ GetViewedTag(oScreen);
                        gblInnerHTML += '</td>';
                        gblInnerHTML += '</tr>';*/
                        
                        gblInnerHTML += '<div class="screen">';
                        gblInnerHTML += sURHereScreenImg;
                        gblInnerHTML += '<a id="lnkScreenSelect_' + oScreen.id + 
                                    '" title="'+ oScreen.name + '" href="javascript:ScreenClicked(' + oScreen.id + 
                                    ')" class="screenLink">' + oScreen.pageNumber + '. ' + oScreen.name + ' </a>'+ GetViewedTag(oScreen);
                        gblInnerHTML += '</div>';                

                        //alternate colors
                        intPageCount += (bIsPreassessment) ? 0 : 1;
                        var sItemStyle = ((intPageCount % 2 == 0) ? 'altItemStyle' : 'ItemStyle');
                        gblInnerHTML = formatString(gblInnerHTML, [sItemStyle]);                                    
                    //}
        }
        else
        {
            for(var i = 0; i < mod.moduleObjects.length; i++)
            {
                if(mod.moduleObjects[i].type == 'module')
                {
                   RenderModuleLinear(mod.moduleObjects[i]);
                }
                else if(mod.moduleObjects[i].type == 'screen')
                {
                    //not sure about scenarios here
                    
                    //show screen details
                    var oScreen = mod.moduleObjects[i];
                    var bIsPreassessment = oScreen.topicPreassessment;
                    var sURHereScreenImg = formatString(sURHereImg, [(oCurrScreen.id == oScreen.id) ? 'visible' : 'hidden']);
                    
                    
                    // do not render preassessments if bShowPreassessments is false
                    //glossary_coursemap_middleMiddle.gif
                    if ((bShowPreassessments && bIsPreassessment) || !bIsPreassessment) { 
                        /*gblInnerHTML += '<tr>';
                        gblInnerHTML += '<td style="background-color:Transparent;width:22px;">' + sURHereScreenImg + '</td>';
                        gblInnerHTML += '<td align="Center" class="{0}">';
                        gblInnerHTML += '<span id="lblCount_' + oScreen.id + 
                                      '">' + ((oScreen.pageNumber=='--') ? '--' : oScreen.pageNumber + '.') + '</span>';
                        gblInnerHTML += '</td>';
                        gblInnerHTML += '<td class="{0}"><span id="lblTopicName_' + oScreen.id;
                        gblInnerHTML += '">' + modName + '</span>';
                        gblInnerHTML += '</td>';
                        gblInnerHTML += '<td class="{0}">';
                        gblInnerHTML += '<a id="lnkScreenSelect_' + oScreen.id + 
                                    '" title="Go to this screen" href="javascript:ScreenClicked(' + oScreen.id + 
                                    ')" class="screenLink">' + oScreen.name + ' </a>'+ GetViewedTag(oScreen);
                        gblInnerHTML += '</td>';
                        gblInnerHTML += '</tr>';*/
                        
                        gblInnerHTML += '<div class="screen">';
                        gblInnerHTML += sURHereScreenImg;
                        gblInnerHTML += '<a id="lnkScreenSelect_' + oScreen.id + 
                                    '" title="'+ oScreen.name + '" href="javascript:ScreenClicked(' + oScreen.id + 
                                    ')" class="screenLink">' + oScreen.pageNumber + '. ' + oScreen.name + ' </a>'+ GetViewedTag(oScreen);
                        gblInnerHTML += '</div>';

                        //alternate colors
                        intPageCount += (bIsPreassessment) ? 0 : 1;
                        var sItemStyle = ((intPageCount % 2 == 0) ? 'altItemStyle' : 'ItemStyle');
                        gblInnerHTML = formatString(gblInnerHTML, [sItemStyle]);                                    
                    }
                }
            }
         }
    }   
}
function ModuleIsInChildren(mod, expandedModId)
{
  if (mod == null)
  {
   return false;
  }
  else if (mod.id == expandedModId)
  {
   return true;
  }
  else if (mod.moduleObjects != null)
  {
    
    for (var i = 0; i< mod.moduleObjects.length; i++)
    {
      if (ModuleIsInChildren(mod.moduleObjects[i],expandedModId))
        return true;
    }
  }
  return false;
}
//var lastMod = null;
function RenderModuleTree(mod, expandedModId)
{
    //var span = getObjByName('spnContent');
    //if (lastMod == null)
    //{
    //lastMod = mod;
    var sURHereImg = '<img src="' + CVF_API.gblDefaultDir + 'u_r_here.gif" style="visibility:{0}" width="22" height="22" alt="you are here">';
    var oCurrScreen = CVF_API.getCurrScreen();
    gblHeaderRendered = false;
    
    if(mod.moduleObjects != null)
    {
        for(var i = 0; i < mod.moduleObjects.length; i++)
        {   
            //don't show sub-modules in a scenario
            if(mod.moduleObjects[i].type == 'module' && mod.moduleObjects[i].pageNumber == null)
            { 
             
                var sURHereModuleImg = formatString(sURHereImg, [(oCurrScreen.parentModule.id == mod.moduleObjects[i].id) ? 'visible' : 'hidden']);
                //alert(mod.moduleObjects[i].id + ' ' + expandedModId);
                if(ModuleIsInChildren(mod.moduleObjects[i],expandedModId))//(mod.moduleObjects[i].id == expandedModId)//
                {
                    gblInnerHTML += '<div class="group">';
                    gblInnerHTML += sURHereModuleImg;
                    gblInnerHTML += '<a href="javascript:RenderCourseMap(' + 
                                  mod.moduleObjects[i].parentModule.id +')" title="' + mod.moduleObjects[i].name + '" class="screenLink"><img src="' + CVF_API.gblDefaultDir + 'minus.gif"></a><span>' + mod.moduleObjects[i].name + '</span>' + GetViewedTag(mod.moduleObjects[i]);
                    
                    intPageCount = 1;
		    if (mod.moduleObjects[i].moduleType == 'Scenario' || mod.moduleObjects[i].moduleType == 'NoBookmarkScenario')
			RenderModuleLinear(mod.moduleObjects[i]);
		    else
                    	RenderModuleTree(mod.moduleObjects[i], expandedModId);
                    //RenderModuleLinear(mod.moduleObjects[i]);
                    gblInnerHTML += '</div>';
                }
                else
                {
                     
                    //show mod and have it active
                    gblInnerHTML += '<div class="group">';
                    gblInnerHTML += sURHereModuleImg;
                    gblInnerHTML += '<a href="javascript:RenderCourseMap(' + 
                                  mod.moduleObjects[i].id +')" title="'+mod.moduleObjects[i].name+'" class="screenLink"><img src="' + CVF_API.gblDefaultDir + 'plus.gif">'+ mod.moduleObjects[i].name + '</a>' + GetViewedTag(mod.moduleObjects[i]);
                    gblInnerHTML += '</div>';
                }
            }
            //else if (mod.moduleType != 'Scenario')
            //{
               //RenderModuleLinear(mod.moduleObjects[i]);
            //}
            else
            {
                //its a screen
                var sURHereScreenImg = formatString(sURHereImg, [(oCurrScreen.id == mod.moduleObjects[i].id) ? 'visible' : 'hidden']);
                
                gblInnerHTML += '<div class="screen">'
                gblInnerHTML += sURHereScreenImg
                gblInnerHTML += '<a id="lnkScreenSelect_' + mod.moduleObjects[i].id + 
                                    '" title="'+mod.moduleObjects[i].name+'" href="javascript:ScreenClicked(' + mod.moduleObjects[i].id + 
                                    ')" class="screenLink">' + mod.moduleObjects[i].pageNumber + '. ' + mod.moduleObjects[i].name + ' </a>'+ GetViewedTag(mod.moduleObjects[i]);
                gblInnerHTML += '</div>';
            }
        }
    }
    //}
}

