//utility functions
function getObjByName(name, doc) {
    var o = 0;

    if (!doc) doc = document;
    if (doc[name]) o = doc[name];
    if (!document.all) {

        return doc.getElementById(name);
    }
    if (document.all && doc.all[name])
    { o = doc.all[name]; }
    if (o) {
        if (!o.getElementsByTagName) o.getElementsByTagName = getElementsArray;
        return o;
    }
    if (document.layers) {
        for (var i = 0; i < doc.layers.length; i++) {
            var lyrdoc = doc.layers[i].document;

            if (lyrdoc[name]) return lyrdoc[name];
            if (lyrdoc.layers.length > 0) {
                var o = getObjByName(name, lyrdoc);
                if (o) return o;
            }
        }
    }
    return 0;
}
if (!document.getElementById) document.getElementById = getObjByName;

function MM_openBrWindow(theURL, winName, features) {
    var path = "";
    for (var i = 3; i < document.URL.split('/').length - 1; i++) {
        path += "/" + document.URL.split('/')[i];
    }

    if (theURL.charAt(0) != '/') {
        theURL = path + '/' + theURL;
    }
    viewer = document.open(theURL, winName, features); viewer.focus();
}

function PageQuery(q) {
    if (q.length > 1) this.q = q.substring(1, q.length);
    else this.q = null;
    this.keyValuePairs = new Array();
    if (this.q) {
        for (var i = 0; i < this.q.split("&").length; i++) {
            this.keyValuePairs[i] = this.q.split("&")[i];
        }
    }
    this.getKeyValuePairs = function () { return this.keyValuePairs; }
    this.getValue = function (s) {
        for (var j = 0; j < this.keyValuePairs.length; j++) {
            if (this.keyValuePairs[j].split("=")[0] == s)
                return this.keyValuePairs[j].split("=")[1];
        }
        return false;
    }
    this.getParameters = function () {
        var a = new Array(this.getLength());
        for (var j = 0; j < this.keyValuePairs.length; j++) {
            a[j] = this.keyValuePairs[j].split("=")[0];
        }
        return a;
    }
    this.getLength = function () { return this.keyValuePairs.length; }
}
function queryString(key) {
    var page = new PageQuery(window.location.search);
    return unescape(page.getValue(key));
}

//global variables
var gblCourse;
var gblModules = new Array();
var gblResourceModules = new Array();
var gblScreens = new Array();
var gblSortedScreens = new Array();
var gblGlossary = new Array();
//var gblNumScreens = 0;
//var gblCurrentScreenIndex = 0;

var gblReturnScreen;
var gblCurrentScreen;
//var gblCurrentScreenIndex;
//var gblNextScreen;
//var gblPreviousScreen;
var gblBackScreens = new Array();
var gblPreviousButtonNavigatesHistory = false;
var gblEvaluation = false;

var gblScreenFrameWidth = 0;
var gblScreenFrameHeight = 0;

var gblScreenPathRelative = '../../';

var gblCourseMapStyle = 'tree';


var gblThemeDir = '';

var gblDefaultDir = '';

var gblReturnToQuizButton;
var gblNextButton;
var gblPreviousButton;
var gblExitButton;
var gblCourseMapButton;
var gblLaunchButton;
var gblGlossaryButton;
var gblSearchButton;
var gblReplayButton;
var gblMainMenuButton;
var gblMuteButton;
var gblFAQButton;
var gblResourcesButton;

var gblHomeScreenID = -1;
var gblResourcesScreenID = -1;
var gblMainMenuBackButton;

var gblBreadCrumbLabel;
var gblCourseLabel;
var gblModuleLabel;
var gblTopicLabel;
var gblScreenLabel;
var gblCurrentPageLabel;
var gblNumPagesLabel;
var CVF_API = window;

var gblScreenFrame;
var gblNavFrame;
var gblNavDocument;

var gblCourseMapURL;
var gblCourseGlossaryURL;
var gblCourseNavigationURL;
var gblCourseSearchURL;
var gblMainMenuURL;
var gblCourseFAQURL;

var gblStartOnMainMenu = false;

var gblSoundOn = true;
var gblFailedQuiz = null;

var gblDefaultLearningStyle = 'tellme';

//caching functions
var gblCurrentlyCachingScreen;
var gblCurrMediaIdx = 0;
var gblMediaArray = new Array();

var gblMaxPreCache = 100;

var cacheloops = 0;

function cacheNext() {

    //loop to the start of the array if we have read to the end
    if (gblCurrMediaIdx == gblMediaArray.length) { gblCurrMediaIdx = 0; cacheloops++ }
    //call cacheflash with the next file to cache
    if (gblMediaArray.length > 0 && cacheloops <= 1) {
        try {

            var m = getObjByName("cacheflash", document);
            m.SetVariable("strMediaURL", '../media/content/' + gblMediaArray[gblCurrMediaIdx]);
            var currCacheIndex = getCurrScreen().cacheIndex;
            if (gblCurrMediaIdx < (currCacheIndex + gblMaxPreCache))
                gblCurrMediaIdx++;
        }
        catch (ex) { }
    }
}

function startCache() {
    try {
        var m = getObjByName("cacheflash", document);
        m.SetVariable("strMediaURL", '../media/content/' + gblMediaArray[gblCurrMediaIdx]);
    }
    catch (ex) { }
}

function cacheflash_DoFSCommand(command, args) {
    window.setTimeout('cacheNext();', 1000);
}

var isInternetExplorer = navigator.appName.indexOf("Microsoft") != -1;
if (navigator.appName && navigator.appName.indexOf("Microsoft") != -1 && navigator.userAgent.indexOf("Windows") != -1 && navigator.userAgent.indexOf("Windows 3.1") == -1) {
    document.write('<script language=\"VBScript\"\>\n');
    document.write('On Error Resume Next\n');
    document.write('Sub cacheflash_FSCommand(ByVal command, ByVal args)\n');
    document.write('	Call cacheflash_DoFSCommand(command, args)\n');
    document.write('End Sub\n');
    document.write('</script\>\n');
}

window.setTimeout('startCache()', 45000);

//course functions - builds out the course to mirror the authoring structure
function initCourse(id, name, completed, baseModule) {
    this.type = 'course';
    this.id = id;
    this.name = name;
    this.completed = completed;
    this.baseModule = baseModule;

}

function randModule(module1, useseed) {
    var tmpScreens = new Array();
    var delScreens = new Array();

    module1.screens = shuffle(module1.screens, useseed);
    for (var i = 0; i < module1.randomNumToShow; i++) {
        tmpScreens[tmpScreens.length] = module1.screens[i];
        //alert(tmpScreens[i].name);
    }
    for (var i = module1.randomNumToShow; i < module1.screens.length; i++) {
        for (var j = 0; j < gblScreens.length; j++) {
            if (module1.screens[i].id == gblScreens[j].id) {
                gblScreens.splice(j, 1);
                gblSortedScreens.splice(j, 1);
                j = gblScreens.length;
            }
        }
    }
    if (i > 0) {
        module1.screens = tmpScreens;
        module1.moduleObjects = tmpScreens;
    }
    //alert(module1.screens[1].name);
}

function shuffle(o, useseed) { //v1.0
    if (useseed) {
        for (var j, x, i = o.length; i; j = Math.floor(genRandomWithSeed() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }
    else {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }
}
var gblSeed = Math.random();
var gblSeedStep = 0;
function initSeed() {
    //alert("LOAD: initializing seed; gblSeed = " + gblSeed);
    var suspendData = getSuspendData().split('~');
    if (getSuspendData() == '') {
        // alert("no suspend data");
        gblSeed = Math.random();
    }
    else {
        //alert("LOAD: suspend data found");
        if (suspendData.length > 1) {
            gblSeed = parseFloat(suspendData[1]);
            //alert("LOAD: Found gblSeed = " + gblSeed);
            setSuspendData(suspendData[0]);
        }
        else {
            gblSeed = Math.random();
            //alert("LOAD: no seed found, newSseed = " + gblSeed);
        }
    }
}

function genRandomWithSeed() {
    var input = Number(gblSeed) + (gblSeedStep++);
    //alert("gblSeed = " + gblSeed + ",\ngblSeedStep = " + gblSeedStep + ",\ninput = " + input);
    var x = Math.sin(input) * 10000;
    return x - Math.floor(x);
}

function initModule(id, name, parentModule, completed, moduleType, isRandom, randomNumToShow, disableNavigation, isResource) {
    this.type = 'module';
    this.moduleType = moduleType;
    this.isRandom = isRandom;
    this.randomNumToShow = randomNumToShow;
    this.id = id;
    this.name = name;
    this.active = false;


    //used only to determine what the last visited screen in a scenario is
    this.lastVisitedScenarioScreen = null;

    if (parentModule != null && isResource != true) {
        parentModule.moduleObjects[parentModule.moduleObjects.length] = this;
        parentModule.modules[parentModule.modules.length] = this;
    }
    this.parentModule = parentModule;
    this.completed = completed;
    this.moduleObjects = new Array();
    this.modules = new Array();
    this.screens = new Array();
    this.disableNavigation = disableNavigation;
    this.isResource = isResource;
    this.rootModuleIsResource = isResource;
    //this.rootModule = gblCourse.baseModule;
    if (parentModule != null) {
        this.rootModuleIsResource = (isResource || parentModule.isResource);
    }
    if (this.rootModuleIsResource) {
        if (parentModule.isResource) {
            this.rootModule = parentModule.rootModule;
        }
        else {
            gblResourceModules[gblResourceModules.length] = this;
            this.rootModule = this;
        }

    }
    else {
        gblModules[gblModules.length] = this;
    }

}
function initScreen(id, name, parentModule, htmlFile, visited, autoLaunchCourseMap, maxscore, lockNavigation, streamNarration, passingScore, isScored, completesParent) {
    this.type = 'screen';
    this.id = id;

    if (typeof orgID != 'undefined') {
        this.id = orgID;
    }
    else {
        this.id = id;
    }

    this.name = name;


    parentModule.moduleObjects[parentModule.moduleObjects.length] = this;
    parentModule.screens[parentModule.screens.length] = this;
    this.parentModule = parentModule;

    this.htmlFile = htmlFile;
    this.visited = visited;
    this.completesParent = completesParent;
    this.active = false;
    this.score = -1;
    this.maxscore = maxscore;
    this.completed = false;

    this.isCompleted = isScreenCompleted;
    this.lockNavigation = lockNavigation;
    this.cacheIndex = gblMediaArray.length;
    this.streamNarration = streamNarration;
    this.passingScore = passingScore;
    this.isScored = isScored;
    this.jumpTos = new Array();
    this.cacheContent = new Array();
    this.nextScreen = null;
    this.previousScreen = null;
    //will sort the screens later
    gblSortedScreens[gblSortedScreens.length] = this;
    gblScreens[gblScreens.length] = this;
    //the page number will be determined by whether or not it
    //is in a scenario - all screens in a scenario have the 
    //same page #
    //therefore, this will have to be built out once the whole tree is built
    this.pageNumber = 0;

    if (parentModule.rootModuleIsResource) {
        this.isScored = false;
    }
}

function initGlossaryItem(id, abbreviation, definition, phrase) {
    var gi = new glossaryItem(id, abbreviation, definition, phrase);
}

function glossaryItem(id, abbreviation, definition, phrase) {
    this.id = id;
    this.abbreviation = abbreviation;
    this.definition = definition;
    this.phrase = phrase;
    gblGlossary[gblGlossary.length] = this;
}

function initJumpTo(fromScreen, toScreen, condition) {
    this.fromScreen = fromScreen;
    this.fromScreen.jumpTos[this.fromScreen.jumpTos.length] = this;
    this.toScreen = toScreen;
    this.condition = condition;
}

function testfire() {
    alert('blah');
}

function attachContent(fileURL, toScreen) {
    toScreen.cacheContent = fileURL;
}

//course functions - builds out the course as it will be navigated
//first clean out screens in modules that won't appear because the module
//isRandom and the module is only going to show a set number of screens


//figure out how many pages there will be, based on those modules that are scenarios
//note that when paginating, if a module is a scenario, all screens in that scenario
//will have the same page 'number's
//also, when displaying the course map, scenarios will only appear as a single page -
//the start page. Additionally - submodules in a scenario will not appear in the course map.


function isScreenCompleted() {
    // this.completed = ((this.visited && !this.isScored) || (this.visited && this.score > -1 && this.isScored));
    // if (this.completed)
    // this.parentModule.completed = true;
    return (((this.visited && !this.isScored) || (this.visited && this.score > -1 && this.isScored)) || this.completed);
}
function getCurrScreen() {
    //return gblScreens[gblCurrentScreenIndex];
    return gblCurrentScreen;
}
function setCurrScreen(value) {
    gblCurrentScreen = value;
    if (gblCurrentScreen.parentModule.rootModuleIsResource != true) {
        gblReturnScreen = gblCurrentScreen;
    }
}

function getModuleByScreenID(intScreenID) {
    //return getScreenByScreenID(intScreenID).topic.module;
    return null;
}

function getModuleByModuleID(intModuleID) {
    for (var i = 0; i < gblModules.length; i++) {
        if (gblModules[i].id == intModuleID) {
            return gblModules[i];
            break;
        }
    }
    return null;
}

//button functions
function initButton(imgUp, imgOver, imgDisabled, imgID, funcOnClick, strAlt, strDisabledAlt) {

    this.btnEnabled = btnEnabled;
    this.imgID = imgID;
    this.image = getObjByName(imgID, gblNavDocument);
    this.funcOnClick = funcOnClick;

    //the following block will fail if the image button isn't actually on the nav template
    try {
        this.image.imgUp = imgUp;
        this.image.imgOver = imgOver;
        this.image.imgDisabled = imgDisabled;
        this.image.onmouseover = btnMouseOver;
        this.image.onmouseout = btnMouseOut;

        var linkName = this.imgID;
        linkName = linkName.replace(/btn/, "lnk");

        var link = getObjByName(linkName, gblNavDocument);
        //alert(link);


        if (link != 0 && link != null) {
            link.onclick = funcOnClick;
        }
        else {
            this.image.onclick = funcOnClick;
        }

        this.image.alt = strAlt;
        this.image.strDisabledAlt = strDisabledAlt;
        this.image.strAlt = strAlt;
        this.image.style.cursor = "pointer";
        this.btnEnabled(true);
    }
    catch (ex)
    { }
}
function printScreen() {
    if (document.frames[0].frames[0].frames[0]) {
        document.frames[0].frames[0].frames[0].focus();
    }
    else {
        document.frames[0].frames[0].focus();
    }
    window.print();
}
function btnEnabled(val) {
    try {
        this.image.enabled = val;

        this.image.enabled = val;

        var linkName = this.imgID;
        linkName = linkName.replace(/btn/, "lnk");
        var link = getObjByName(linkName, gblNavDocument);

        if (val) {
            if (link != 0 && link != null)
                link.onclick = this.funcOnClick;
            else
                this.image.onclick = this.funcOnClick;

            this.image.alt = this.image.strAlt; this.image.src = this.image.imgUp; this.image.style.cursor = "pointer";
        }
        else {
            if (link != 0 && link != null)
                link.onclick = null;
            else
                this.image.onclick = null;

            this.image.alt = this.image.strDisabledAlt; this.image.src = this.image.imgDisabled; this.image.style.cursor = "text";
        }


    }
    catch (e)
    { }
}

function btnMouseOver() {
    if (this.enabled)
        this.src = this.imgOver;
    else
        this.src = this.imgDisabled;
}

function btnMouseOut() {
    if (this.enabled)
        this.src = this.imgUp;
    else
        this.src = this.imgDisabled;
}
//label functions

function initLabel(lblID) {
    this.lblID = lblID;
    this.label = getObjByName(lblID, gblNavDocument);
    this.setText = setText;
}

function setText(strText) {
    try {
        this.label.innerHTML = strText;
    }
    catch (e) { }
}

//page functions

function initStartPage() {
    //  var qryScreenID = queryString('ScreenID');
    //    if (qryScreenID)
    //    {
    //        var blnMatchFound = false;
    //        for (var i=0;i<gblNumScreens;i++)
    //        {
    //          if (gblScreens[i].id == qryScreenID)
    //          { 
    //            blnMatchFound = true;
    //            gblCurrentScreenIndex = i;
    //            return i;
    //          }
    //        }
    //        if (!blnMatchFound)
    //            return 0;
    //    }
    //    else
    //        gblCurrentScreenIndex = 0;
}


//todo
function initLabels() {

    var currScreen;

    currScreen = getCurrScreen();
    gblCurrentPageLabel.setText(currScreen.pageNumber);

    //gblNumPagesLabel.setText(gblScreens[gblScreens.length - 1].pageNumber);
    if (currScreen.parentModule.rootModuleIsResource) {
        gblNumPagesLabel.setText(getLastScreenInModule(currScreen.parentModule.rootModule).pageNumber);
    }
    else {
        gblNumPagesLabel.setText(getLastScreenInModule(gblCourse.baseModule).pageNumber);
    }
    //gblNumPagesLabel.setText(getLastScreenInModule(currScreen.Root.pageNumber);

    gblCourseLabel.setText(gblCourse.name);
    //gblModuleLabel.setText(currScreen.topic.module.name);
    //gblTopicLabel.setText(currScreen.topic.name);
    gblScreenLabel.setText(currScreen.name);

    if (gblBreadCrumbLabel != null) {
        var parent = currScreen.parentModule;
        var strBreadCrumb = parent.name;
        parent = parent.parentModule;
        while (parent != null) {
            strBreadCrumb = parent.name + ' - ' + strBreadCrumb;
            parent = parent.parentModule;
        }
        gblBreadCrumbLabel.setText(strBreadCrumb);
    }
}

//todo
function initButtons() {
    if (getNextScreen() != null)
        gblNextButton.btnEnabled(true);
    else
        gblNextButton.btnEnabled(false);

    if (getPreviousScreen() != null)
        gblPreviousButton.btnEnabled(true);
    else
        gblPreviousButton.btnEnabled(false);
    /*if (gblNextScreen != null)
        gblNextButton.btnEnabled(true);
    else
        gblNextButton.btnEnabled(false);

    if (gblPreviousScreen != null || (gblPreviousButtonNavigatesHistory && gblBackScreens.length > 0))
        gblPreviousButton.btnEnabled(true);
    else
        gblPreviousButton.btnEnabled(false);*/

    // when return to quiz is visible disable CM, Search and Main Menu  
    //var bReturnToQuizHidden = !isQuizButtonVisible();

    //        gblExitButton.btnEnabled(true);
    //        gblCourseMapButton.btnEnabled(bReturnToQuizHidden);
    //        gblGlossaryButton.btnEnabled(true);
    //        gblSearchButton.btnEnabled(bReturnToQuizHidden);
    //        gblReplayButton.btnEnabled(true);
    //        gblMainMenuButton.btnEnabled(bReturnToQuizHidden);

    gblExitButton.btnEnabled(true);
    gblCourseMapButton.btnEnabled(true);
    gblGlossaryButton.btnEnabled(true);
    gblSearchButton.btnEnabled(true);
    gblReplayButton.btnEnabled(true);
    gblMainMenuButton.btnEnabled(true);
    if (gblLaunchButton != null)
        gblLaunchButton.btnEnabled(true);



    //if (getCurrScreen().parentModule.moduleType == "Scenario" || getCurrScreen().parentModule.moduleType == "Scenario")
    //   disableNav();
    if (getCurrScreen().parentModule.disableNavigation)
        disableNav();


}

//function initVisitedPages()
//{

//}

function initScreenFrame() {
    setCurrScreenVisited();
    if (getCurrScreen().lockNavigation) {
        disableNav();
        gblNextButton.image.alt = "You must finish the interaction to continue";
        gblPreviousButton.image.alt = "You must finish the interaction to continue";
    }

    //reset the width and height of the screen frame, since it may have been changed
    setScreenFrameParams(gblScreenFrameWidth, gblScreenFrameHeight);
    //gblScreenFrame = getObjByName('frameScreen',document);
    gblScreenFrame.src = gblScreenPathRelative + getCurrScreen().htmlFile;

    if (getIsSCORM() == true)
        saveProgress(false);

    //var cacheIndex = gblScreens[gblCurrentScreenIndex].cacheIndex;
    //cacheIndex++;
    //gblCurrMediaIdx = (cacheIndex<=gblMediaArray.length) ? cacheIndex: cacheIndex-1; 
}

//this function may be called to make the screen frame larger to accomodate large videos/swfs
function setScreenFrameParams(width, height) {
    //only resize the screen frame to larger than its original parameters
    if (width > gblScreenFrameWidth)
        gblScreenFrame.width = width;
    if (height > gblScreenFrameHeight)
        gblScreenFrame.height = height;
}

//used in next function only
gblVarsInitialized = false;

function initializeStudentView() {

    try {
        if (gblMuteButton && gblMuteButton.image) {
            if (gblSoundOn) {
                gblMuteButton.image.alt = 'Turn Sound Off';
            }
            else {
                gblMuteButton.image.alt = 'Turn Sound On';
            }
        }
    }
    catch (ex) { alert(ex.message); }

    //only set the start page and initialize variables if
    //it hasn't been done yet
    if (gblVarsInitialized == false) {
        gblVarsInitialized = true;
        //gblNumScreens = gblScreens.length;
        //if (false)//(getIsSCORM())
        //   initSCORM();
        //else
        initStartPage();
    }

    //if we're on a preassessment and we aren't supposed
    //to show preassessments, move forward until we aren't on a preassessment
    currScreen = getCurrScreen();
    //while (gblCurrentScreenIndex < gblScreens.length)
    //{
    //   gblCurrentScreenIndex++;
    //    currScreen = getCurrScreen();
    //}

    initLabels();
    initButtons();
    //initVisitedPages();

    initScreenFrame();
    //you never want to start on the main menu if
    //the gblcurrentscreenindex > 0 (as a request will have been
    //made in the query string to start on a specific screen,
    //otherwise gblcurrentscreenindex would be 0)


    //if (top.gblCurrentScreenIndex > 0)
    //{
    //  gblStartOnMainMenu = false;
    //}
    if (gblStartOnMainMenu == true) {
        var qryLockModuleID = queryString('LockModuleID');
        if (qryLockModuleID != null)//never show the mainmenu if we aren't showing all modules
        {
            gblStartOnMainMenu = false;
            goMainMenu();
            //the first screen will be flagged as visited, but it won't really be,
            //so un-flag it
            gblCurrentScreen.visited = false;
        }
    }
}

function getFirstScreenInModule(mod) {
    if (mod.moduleType == 'Scenario' && mod.lastVisitedScenarioScreenInModule != null)
        return mod.lastVisitedScenarioScreenInModule;
    var firstScreen = null;
    for (var i = 0; i < mod.moduleObjects.length; i++) {
        if (mod.moduleObjects[i].type == "module") {
            firstScreen = getFirstScreenInModule(mod.moduleObjects[i]);
            if (firstScreen != null)
            { return firstScreen; }
        }
        else if (mod.moduleObjects[i].type == "screen")
        { return mod.moduleObjects[i]; }
    }
    return null;
}

function getFirstScreenAfterModule(afterMod) {
    if (afterMod.parentModule == null)
    { return null; }
    var firstScreen = null;
    var currModulePos = 10000;
    for (var i = 0; i < afterMod.parentModule.moduleObjects.length; i++) {
        if (afterMod == afterMod.parentModule.moduleObjects[i]) {
            currModulePos = i;
        }
        if (currModulePos < i) {
            if (afterMod.parentModule.moduleObjects[i].type == "module") {
                firstScreen = getFirstScreenInModule(afterMod.parentModule.moduleObjects[i]);
                if (firstScreen != null)
                    return firstScreen;
            }
            else if (afterMod.parentModule.moduleObjects[i].type == "screen")
            { firstScreen = afterMod.parentModule.moduleObjects[i]; return firstScreen; }
        }
    }
    firstScreen = getFirstScreenAfterModule(afterMod.parentModule);

    return firstScreen;

}


function getNextScreen() {
    var currModule = getCurrScreen().parentModule;
    var currScreen = getCurrScreen();
    var currScreenPos = 10000;
    var nextScreen = null;
    /*if (currModule.moduleType == "NoBookmarkScenario" || currModule.moduleType == "Scenario")
    {
        while(true){
          if (currModule.parentModule != null && nextScreen == null)
          {
            nextScreen = getFirstScreenAfterModule(currModule);
          }
          else
          {
            return null;
          }
          if (nextScreen != null && nextScreen.pageNumber == currScreen.pageNumber)
          {
            currModule = nextScreen.parentModule;
          }
          else
          {
            return nextScreen;
          }
        }
        
    }*/
    //first, walk the current module and see if there are any screens after this one
    /*for (var i = 0;i<currModule.moduleObjects.length; i++)
    {
      if (currModule.moduleObjects[i] == currScreen)
      {
        currScreenPos = i;
      }
      if (currScreenPos < i)
      {
        if (currModule.moduleObjects[i].type == "module")
        {
          nextScreen = getFirstScreenInModule(currModule.moduleObjects[i]);
        }
        else if (currModule.moduleObjects[i].type == "screen")
        { nextScreen = currModule.moduleObjects[i];}
      }
      if (nextScreen != null) return nextScreen;
    }
    
    //if the current module is the root, there isn't a next screen
    //but if not, and there are no more screens in this module, go up 
    if (currModule.parentModule != null && nextScreen == null)
    {
      nextScreen = getFirstScreenAfterModule(currModule);
    }*/
    //try to optimize where search begins

    var goToPageNum = currScreen.pageNumber + 1;
    var currScreenFound = false;

    if (currScreen.parentModule.isRandom) {
        for (var i = 0; i < ((currScreen.parentModule.screens.length) - 1) ; i++) {
            if (currScreen.parentModule.screens[i].id == currScreen.id)
                return (currScreen.parentModule.screens[i + 1]);
        }

    }


    for (var i = 0; i < gblScreens.length; i++) {
        if (gblScreens[i] == currScreen)
            currScreenFound = true;
        if (currScreenFound) {
            /*if (gblScreens[i].parentModule.isRandom)
            {
              //return gblScreens[i+1];
          for (var j = 0;j<gblScreens[i].parentModule.screens.length;j++)
              {
            if (gblScreens[i].id == gblScreens[i].parentModule.screens[j])
              return gblScreens[i].parentModule.screens[j];
      
              }
            } else*/
            if (gblScreens[i].pageNumber == goToPageNum && gblScreens[i].parentModule.rootModuleIsResource == currScreen.parentModule.rootModuleIsResource) //&& gblScreens[i].parentModule.isResource == currScreen.parentModule.isResource)
            {
                if (!(gblScreens[i].parentModule.rootModuleIsResource) || (gblScreens[i].parentModule.rootModuleIsResource && gblScreens[i].parentModule.rootModule.id == currScreen.parentModule.rootModule.id)) {
                    nextScreen = gblScreens[i];
                    if (nextScreen.parentModule.moduleType == "Scenario" && nextScreen.parentModule.lastVisitedScenarioScreenInModule != null)
                        return nextScreen.parentModule.lastVisitedScenarioScreenInModule;
                    else
                        return nextScreen;
                }
            }
        }
    }
    if (nextScreen == null && currScreen.parentModule.rootModuleIsResource) {
        nextScreen = gblReturnScreen;

    }
    return nextScreen;
}


var gblBreak;
//note that navigation will not follow an index
//we want to navigate along the course structure, as we now have 
//scenarios and jump tos to worry about
function goNextPage() {

    /* gblPreviousScreen = getCurrScreen();
     gblBackScreens[gblBackScreens.length] = getCurrScreen();
     setCurrScreen(gblNextScreen);
     gblNextScreen = getNextScreen();
     */
    setCurrScreen(getNextScreen());
    initLabels();
    initButtons();
    initScreenFrame();

}

function getLastScreenBeforeModule(beforeMod) {
    if (beforeMod.parentModule == null)
    { return null; }
    var lastScreen = null;
    var currModulePos = 0;
    //for (var i = 0; i<afterMod.parentModule.moduleObjects.length; i++)
    for (var i = beforeMod.parentModule.moduleObjects.length; i >= 0; i--) {
        if (beforeMod == beforeMod.parentModule.moduleObjects[i]) {
            currModulePos = i;
        }
        if (currModulePos > i) {
            if (beforeMod.parentModule.moduleObjects[i].type == "module") {
                lastScreen = getLastScreenInModule(beforeMod.parentModule.moduleObjects[i]);
                if (lastScreen != null)
                    return lastScreen;
            }
            else if (beforeMod.parentModule.moduleObjects[i].type == "screen")
            { lastScreen = beforeMod.parentModule.moduleObjects[i]; return lastScreen; }
        }
    }
    lastScreen = getLastScreenBeforeModule(beforeMod.parentModule);

    return lastScreen;

}

function getLastVisitedScenarioScreenInModule(mod) {
    return getFirstScreenInModule(mod);
}

function getLastScreenInModule(mod) {
    if (mod.moduleType == 'Scenario' && mod.lastVisitedScenarioScreenInModule != null)
        return mod.lastVisitedScenarioScreenInModule;
    var lastScreen = null;
    //for (var i = 0;i<mod.moduleObjects.length; i++)
    for (var i = mod.moduleObjects.length - 1; i >= 0; i--) {
        if (mod.moduleObjects[i].type == "module") {
            lastScreen = getLastScreenInModule(mod.moduleObjects[i]);
            if (lastScreen != null)
            { return lastScreen; }
        }
        else if (mod.moduleObjects[i].type == "screen")
        { return mod.moduleObjects[i]; }
    }
    return null;
}


function getPreviousScreen() {
    var previousScreen = null;

    var currModule = getCurrScreen().parentModule;
    var currScreen = getCurrScreen();
    var currScreenPos = 0;
    /*if (currModule.moduleType == "NoBookmarkScenario" || currModule.moduleType == "Scenario")
    {
        while(true){
          if (currModule.parentModule != null && previousScreen == null)
          {
            previousScreen = getLastScreenBeforeModule(currModule);
          }
          else
          {
            return null;
          }
          if (nextScreen != null && previousScreen.pageNumber == currScreen.pageNumber)
          {
            currModule = previousScreen.parentModule;
          }
          else
          {
            return previousScreen;
          }
        }
        
    }*/
    //first, walk the current module and see if there are any screens before this one
    //for (var i = 0;i<currModule.moduleObjects.length; i++)
    /*for (var i = currModule.moduleObjects.length - 1;i>=0; i--)
    {
    //alert(currModule.moduleObjects[i].type + ' sdfs');
    
      if (currModule.moduleObjects[i] == currScreen)
      {
        currScreenPos = i;
      }
      if (currScreenPos > i)
      {
        if (currModule.moduleObjects[i].type == "module")
        {
          previousScreen = getLastScreenInModule(currModule.moduleObjects[i]);
        }
        else if (currModule.moduleObjects[i].type == "screen")
        { previousScreen = currModule.moduleObjects[i];}
      }
      if (previousScreen != null) return previousScreen;
    }
    
    //if the current module is the root, there isn't a previous screen
    //but if not, and there are no more screens in this module, go up 
    if (currModule.parentModule != null && previousScreen == null)
    {
      
      previousScreen = getLastScreenBeforeModule(currModule);
    }*/


    if (currScreen.parentModule.isRandom) {
        for (var i = currScreen.parentModule.screens.length - 1; i > 0 ; i--) {
            if (currScreen.parentModule.screens[i].id == currScreen.id)
                return (currScreen.parentModule.screens[i - 1]);
        }

    }

    var goToPageNum = currScreen.pageNumber - 1;
    //try to optimize where search begins
    var startIndex = gblScreens.length - 1;//((gblScreens[gblScreens.length -1].pageNumber - currScreen.pageNumber) + 1);
    var currScreenFound = false;
    for (var i = startIndex; i >= 0; i--) {
        if (gblScreens[i] == currScreen)
            currScreenFound = true;
        //alert(currScreenFound);
        if (currScreenFound == true && gblScreens[i].pageNumber == goToPageNum && currScreen.parentModule.rootModuleIsResource == gblScreens[i].parentModule.rootModuleIsResource) {
            if (!(gblScreens[i].parentModule.rootModuleIsResource) || (gblScreens[i].parentModule.rootModuleIsResource && gblScreens[i].parentModule.rootModule.id == currScreen.parentModule.rootModule.id)) {
                previousScreen = gblScreens[i];
                if (previousScreen.parentModule.moduleType == "Scenario" && previousScreen.parentModule.lastVisitedScenarioScreenInModule != null)
                    return previousScreen.parentModule.lastVisitedScenarioScreenInModule;
                else if (previousScreen.parentModule.moduleType == "Scenario" || previousScreen.parentModule.moduleType == "NoBookmarkScenario") {
                    currModule = previousScreen.parentModule;
                    var tmpModule = currModule.parentModule;
                    while (tmpModule != null) {
                        if (tmpModule.moduleType == currModule.moduleType && (currModule.moduleType == "Scenario" || currModule.moduleType == "NoBookmarkScenario")) {
                            currModule = tmpModule;
                            tmpModule = tmpModule.parentModule;
                        }
                        else
                            tmpModule = null;
                    }
                    return getFirstScreenInModule(currModule);
                }
                else
                    return previousScreen;
            }
        }
    }
    if (previousScreen == null && currScreen.parentModule.rootModuleIsResource) {
        previousScreen = gblReturnScreen;

    }
    return previousScreen;
}

function goBackPage() {

    if (gblBackScreens.length > 0) {
        setCurrScreen(gblBackScreens[gblBackScreens.length - 1]);
        gblBackScreens.length--;
        /*if (gblBackScreens.length > 0)
        {
          gblPreviousScreen = gblBackScreens[gblBackScreens.length - 1];
        }
        else
        {
          gblPreviousScreen = getPreviousScreen();
        }*/
    }

}

function goPreviousPage() {
    //set the current screen to the previous screen
    /*    gblNextScreen = getCurrScreen();
    
        if (gblBackScreens.length > 0 && gblPreviousButtonNavigatesHistory)
        {
           goBackPage();
        }
        else
        {
          setCurrScreen(gblPreviousScreen);
          gblPreviousScreen = getPreviousScreen();
        }*/
    setCurrScreen(getPreviousScreen());
    initLabels();
    initButtons();
    initScreenFrame();
}

function setCurrScreenPassed() {
    var currScreen = getCurrScreen();
    if (currScreen.lockNavigation)
        enableNav();
    currScreen.score = currScreen.maxscore;
    setCurrScreenVisited();
    setInteractionStatus(currScreen.id, 'correct', currScreen.name);

    //goNextIncompleteScreen();
}
function setCurrScreenFailed() {

    var currScreen = getCurrScreen();
    if (currScreen.lockNavigation)
        enableNav();
    currScreen.score = 0;

    setCurrScreenVisited();
    setInteractionStatus(currScreen.id, 'incorrect', currScreen.name);

    //goNextIncompleteScreen();

    //showQuizButton();
}

function setCurrScreenInteractionStatus(result, correct_response, learner_response, type, scaled_score) {

    var currScreen = getCurrScreen();
    if (currScreen.lockNavigation)
        enableNav();
    if (result == 'correct') {
        if (scaled_score > -1) {
            currScreen.score = currScreen.maxscore * scaled_score;
        }
        else
            currScreen.score = currScreen.maxscore;
    }
    else
        currScreen.score = 0;

    setCurrScreenVisited();
    setInteractionStatus(currScreen.id, result, currScreen.name, correct_response, learner_response, type)

    //goNextIncompleteScreen();
}

//Not used (we have no interactions with scores other than pass/fail)
/*function setCurrScreenScore(score)
{
  var currScreen = getCurrScreen();
  if (currScreen.lockNavigation)
    enableNav();
  currScreen.score = score;
  
  setCurrScreenVisited();
  if (score == currScreen.maxscore)
    goNextIncompleteScreen();
  else
    goNextPage();    
}*/

function evaluateModuleCompletion(forModule) {
    if (forModule.completed == true)
        return true;
    var blnModuleCompleted = true;
    //walk the module if it's completed flag == false
    for (var i = 0; i < forModule.moduleObjects.length; i++) {
        //alert(forModule.moduleObjects[i].type);
        if (forModule.moduleObjects[i].type == "module") {
            blnModuleCompleted = (blnModuleCompleted && evaluateModuleCompletion(forModule.moduleObjects[i]));
        }
        else if (forModule.moduleObjects[i].type == "screen") {
            var currScreen = forModule.moduleObjects[i];
            blnModuleCompleted = (blnModuleCompleted && currScreen.isCompleted());
        }
        if (!blnModuleCompleted) {
            forModule.completed = false;
            return false;
        }
    }
    forModule.completed = blnModuleCompleted;
    return blnModuleCompleted;
}
function evaluateCourseCompletion() {
    var rootModCompleted = evaluateModuleCompletion(gblCourse.baseModule);
    gblCourse.completed = rootModCompleted;
    return rootModCompleted;
}

function setCurrScreenVisited() {
    var currScreen = getCurrScreen();
    currScreen.visited = true;
    //TODO: not sure about the way this whole 'completed' thing is implemented...
    currScreen.completed = currScreen.isCompleted();
    currModule = currScreen.parentModule;
    if (currScreen.completed && currScreen.completesParent) {
        //currModule.completed = true;
        setModuleCompleted(currModule)
    }
    while (currModule.moduleType == 'Scenario') {
        currModule.lastVisitedScenarioScreenInModule = currScreen;
        currModule = currModule.parentModule;
    }
}

//function goNextIncompleteScreen()
//{

//}


function setModuleCompleted(module) {
    for (var i = 0; i < module.moduleObjects.length; i++) {
        module.moduleObjects[i].completed = true;
        if (module.moduleObjects[i].type == "module") {
            setModuleCompleted(module.moduleObjects[i]);
        }
        /*else if (module.moduleObjects[i].type == "screen")
        { 
           
        }*/
    }
}

function doReplay() {
    initScreenFrame();
}


navigator.sayswho = (function () {
    var N = navigator.appName, ua = navigator.userAgent, tem;
    var M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) M[2] = tem[1];
    M = M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];

    return M;
})();

function openCourseMap() {
    var themedir = gblThemeDir;
    MM_openBrWindow(gblRelativePathToFiles + themedir + gblCourseMapURL, 'CourseMap', 'scrollbars=yes,resizable=yes,width=720,height=500,left=60,top=100');
}

function getThemeDir() {
    var themedir = gblThemeDir;
    if (navigator.appName == "Microsoft Internet Explorer") {
        return (gblRelativePathToFiles + themedir);
    }
    else {
        return themedir;
    }
}
function openGlossary(forceRelativePath) {
    var themedir = gblThemeDir;
    MM_openBrWindow(gblRelativePathToFiles + themedir + gblCourseGlossaryURL, 'Glossary', 'scrollbars=yes,resizable=no,width=720,height=500,left=60,top=100');
}
function openSearch() {
    MM_openBrWindow(gblRelativePathToFiles + themedir + gblCourseSearchURL, 'CourseMap', 'scrollbars=yes,resizable=no,width=720,height=500,left=60,top=100')
}
function openFAQ() {
    MM_openBrWindow(gblRelativePathToFiles + themedir + gblCourseFAQURL, 'FAQ', 'scrollbars=yes,resizable=no,width=500,height=500,left=60,top=100')
}
function openResources() {
    var themedir = gblThemeDir;
    MM_openBrWindow(gblRelativePathToFiles + themedir + 'Resources.html', 'Glossary', 'scrollbars=yes,resizable=no,width=720,height=500,left=60,top=100')
}

function goResources() {
    if (gblResourcesScreenID < 1) {
        alert('A Resources Screen has not been defined for this course.');
    }
    else {

        goScreen(gblResourcesScreenID);
    }
}

function goMainMenu() {
    if ((gblMainMenuURL == '' || gblMainMenuURL == null) && gblHomeScreenID < 1) {
        alert('A Main Menu/Home Screen has not been defined for this course.');
    }
    else {
        if (gblHomeScreenID > 0)
            goScreen(gblHomeScreenID);
        else
            gblNavFrame.src = gblMainMenuURL;
    }
}
function goPreassessmentChoice() {
    gblNavFrame.src = gblPreassessmentChoiceURL;
}
function goPreassessment() {
    gblOnPreassessment = true;
    gblNavFrame.src = gblCourseNavigationURL;
}
function goCourseNavigation() {
    gblOnPreassessment = false;

    gblNavFrame.src = gblRelativePathToFiles + gblThemeDir + gblCourseNavigationURL;
}

function goScreenFromMainMenu(intScreenID) {
    goCourseNavigation();

    var blnMatchFound = false;
    //must do this rather than goscreen because the screenframe won't be there
    for (var i = 0; i < gblScreens.length; i++) {
        if (gblScreens[i].id == intScreenID) {
            blnMatchFound = true;
            gblBackScreens[gblBackScreens.length] = getCurrScreen();
            setCurrScreen(gblScreens[i]);
            //gblPreviousScreen = getPreviousScreen();
            //gblNextScreen = getNextScreen();
            break;
        }
    }
}

function goModuleFromMainMenu(intModuleID) {
    goCourseNavigation();
    var mod = getModuleByModuleID(intModuleID);
    var scrn = getFirstScreenInModule(mod);
    if (scrn != null) {
        gblBackScreens[gblBackScreens.length] = getCurrScreen();
        setCurrScreen(scrn);
        //gblPreviousScreen = getPreviousScreen();
    }
    else {
        gblBackScreens[gblBackScreens.length] = getCurrScreen();
        setCurrScreen(gblScreens[0]);
    }
    //gblNextScreen = getNextScreen();
}

function doExit() {
    if (getIsSCORM()) {
        doExitSCORM();
        if (top.window == window) {
            window.opener = null;
            window.close();
        }
    }
    else {
        top.window.opener = null;
        top.window.close();
    }
}


function doKrystalExit() {
    window.location = "http://www.krystalkollege.com/MainPage.asp";
}

function goScreen(intScreenID) {
    if (intScreenID) {
        var blnMatchFound = false;
        for (var i = 0; i < gblScreens.length; i++) {

            if (gblScreens[i].id == intScreenID) {
                blnMatchFound = true;
                gblBackScreens[gblBackScreens.length] = getCurrScreen();
                setCurrScreen(gblScreens[i]);
                //gblPreviousScreen = getPreviousScreen();
                //gblNextScreen = getNextScreen();

                initLabels();
                initButtons();
                initScreenFrame();

                break;
            }
        }
    }
}


function enableNext(blnValue) {

}

function enablePrevious(blnValue) {

}

function enableNav() {
    gblNextButton.btnEnabled(true);
    gblPreviousButton.btnEnabled(true);
    gblCourseMapButton.btnEnabled(true);
    gblSearchButton.btnEnabled(true);
    //gblReplayButton.btnEnabled(true);
    gblMainMenuButton.btnEnabled(true);
}

function disableNav() {
    gblNextButton.btnEnabled(false);
    gblPreviousButton.btnEnabled(false);
    gblCourseMapButton.btnEnabled(false);
    gblSearchButton.btnEnabled(false);
    //gblReplayButton.btnEnabled(false);
    gblMainMenuButton.btnEnabled(false);
}
function toggleSound() {
    var navFrame = document.getElementById("NavFrame");
    var navDoc = navFrame.contentWindow.document;

    var frameScreen = navDoc.getElementById("frameScreen");
    var frameDoc = frameScreen.contentWindow.document;

    var narrAudio = frameDoc.getElementById("jp_audio_0");
    if (narrAudio != null) {
        if (narrAudio.paused) {
            narrAudio.play();
        } else {
            narrAudio.pause();
        }
    } else {
        gblSoundOn = !gblSoundOn;
        if (gblSoundOn) {
            gblMuteButton.image.alt = 'Turn Sound Off';
        }
        else {
            gblMuteButton.image.alt = 'Turn Sound On';
        }
    }
}
function screenInModule(screenID, module) {
    for (var i = 0; i < module.moduleObjects.length; i++) {
        if (module.moduleObjects[i].type == "module") {
            if (screenInModule(screenID, module.moduleObjects[i]))
            { return true; }
        }
        else if (module.moduleObjects[i].type == "screen" && module.moduleObjects[i].id == screenID)
        { return true; }
    }
    return false;
}
function unload_CVF() {
    if (gblSCORMAPI != null) {
        try {
            doExitSCORM();
        } catch (ex) { }
    }
}
// this function re-initializes our global course arrays 
// if we are passed a module id in the querystring
function onCourseLoaded() {   //randomize the module screens if applicable
    if (qryNoSCORM != 'true')
        gblSCORMAPI = getAPI();
    initSCORM();
    //alert("OnCourseLoaded");
    for (var i = 1; i < gblModules.length; i++) {
        if (gblModules[i].isRandom) {
            if (gblModules[i].randomNumToShow == -1) {
                gblModules[i].randomNumToShow = gblModules[i].screens.length;
            }
            randModule(gblModules[i], true);
        }
    }

    var qryLockModuleID = queryString('LockModuleID');
    var qryNoSCORM = queryString('NoSCORM');
    if (qryLockModuleID > 0) {
        var oModule = getModuleByModuleID(qryLockModuleID);


        if (oModule) {
            gblStartOnMainMenu = false;

            gblScreens[gblScreens.length - 1].pageNumber = enumeratePages(oModule, 1) - 1;

            oModule.parentModule = null;
            gblCourse.baseModule = oModule;

            var firstScrn = getFirstScreenInModule(oModule);
            /*var lastScrn = getLastScreenInModule(oModule);
             //trim the global arrays
             while (gblMediaArray.length > lastScrn.cacheIndex)
             {
               gblMediaArray.pop();
             }
             
             while (gblScreens[0] != firstScrn)
             {
               gblScreens.shift();
             }
             while (gblScreens[gblScreens.length -1] != lastScrn)
             {
               gblScreens.pop();
             }
             
             while (gblModules[0] != oModule)
             {
               gblModules.shift();
             }
             
             while (gblModules[gblModules.length - 1] != lastScrn.parentModule)
             {
               gblModules.pop();
             }*/
            var bkmrkID = 0;
            if (gblSCORMAPI != null)
                bkmrkID = getBookmark();

            if (!(bkmrkID > 0) || !screenInModule(bkmrkID, oModule)) {
                setCurrScreen(firstScrn);
                //gblPreviousScreen = getPreviousScreen();
                //gblNextScreen = getNextScreen();
            }
        }
    }
    else {

        var qryScreenID = queryString("ScreenID");

        var currModule = gblCourse.baseModule;
        if (gblScreens.length > 0) {
            enumeratePages(currModule, 1);
            var bkmrkID = 0;
            if (gblSCORMAPI != null)
                bkmrkID = getBookmark();
            if (!(bkmrkID > 0)) {
                if (qryScreenID > 0) {
                    gblStartOnMainMenu = false;
                    //goScreen(qryScreenID); //can't use goscreen (it tries to initialize labels, etc.) 
                    for (var i = 0; i < gblScreens.length; i++) {
                        if (gblScreens[i].id == qryScreenID) {
                            setCurrScreen(gblScreens[i]);
                            //gblPreviousScreen = getPreviousScreen();
                            //gblNextScreen = getNextScreen();
                            break;
                        }
                    }
                }
                else {
                    var qryModID = queryString("ModuleID");
                    if (qryModID > 0) {
                        gblStartOnMainMenu = false;
                        var mod = getModuleByModuleID(qryModID);
                        var scrn = getFirstScreenInModule(mod);
                        if (scrn != null) {
                            setCurrScreen(scrn);
                            //gblPreviousScreen = getPreviousScreen();
                        }
                        else {
                            setCurrScreen(gblScreens[0]);
                        }
                        //gblNextScreen = getNextScreen();
                    }
                    else {
                        //set up the starting screen
                        //gblCurrentScreen = gblScreens[0]; 
                        setCurrScreen(getFirstScreenInModule(currModule));
                        //gblNextScreen = getNextScreen();
                    }
                }
            }

        }
        else {
            alert('There are currently no screens in this course');
        }
    }
    for (var i = 0; i < gblResourceModules.length; i++) {
        if (gblResourceModules[i].parentModule != null && gblResourceModules[i].parentModule.rootModuleIsResource == false)
            enumeratePages(gblResourceModules[i], 1);
    }
    sortScreens();
}



//note: we want all pages in a scenario to have the same page number
function enumeratePages(forModule, currPgNum) {
    var currScreen;
    /*if (forModule.isResource && forModule.parentModule != null && forModule.parentModule.isResource != true)
    {
      currPgNum = 1;
    }*/

    forModule.active = true;

    for (var i = 0; i < forModule.moduleObjects.length; i++) {
        //alert(forModule.moduleObjects[i].type);
        if (forModule.moduleObjects[i].type == "module") {
            var tmpPgNum = enumeratePages(forModule.moduleObjects[i], currPgNum);
            //if (forModule.moduleObjects[i].isResource == forModule.isResource)
            currPgNum = tmpPgNum;
            //if this module is not a scenario, but we just enumerated the pages in the
            //child scenario, increment the page counter (as it won't have been incremented from within)
            if ((forModule.moduleObjects[i].moduleType == "Scenario" || forModule.moduleObjects[i].moduleType == "NoBookmarkScenario") && forModule.moduleType == "Normal") {
                currPgNum++;
            }
        }
        else if (forModule.moduleObjects[i].type == "screen") {
            //alert(currPgNum);
            currScreen = forModule.moduleObjects[i];
            currScreen.pageNumber = currPgNum;
            currScreen.active = true;
            //only increment if not in a scenario
            if (forModule.moduleType != "Scenario" && forModule.moduleType != "NoBookmarkScenario")
                currPgNum++;
        }

    }
    return currPgNum;
}

function returnToQuiz() {
    if (gblReturnToQuizButton) {
        hideQuizButton();
        goScreen(gblFailedQuiz.id);
    }
}

function hideQuizButton() {
    if (gblReturnToQuizButton) {
        gblReturnToQuizButton.btnEnabled(false);
        gblReturnToQuizButton.image.style.visibility = 'hidden';
        gblCourseMapButton.btnEnabled(true);
        gblMainMenuButton.btnEnabled(true);
        gblSearchButton.btnEnabled(true);
    }
}

//function showQuizButton()
//{
//  if (gblReturnToQuizButton) {
//    gblReturnToQuizButton.btnEnabled(true);
//    gblReturnToQuizButton.image.style.visibility = 'visible';
//    gblCourseMapButton.btnEnabled(false);
//    gblMainMenuButton.btnEnabled(false);
//    gblSearchButton.btnEnabled(false);
//  }
//}
//function isQuizButtonVisible()
//{
//  if (gblReturnToQuizButton){
//    return (gblReturnToQuizButton.image.enabled);
//  }
//  else {
//    return (false);
//  }
//}





function playSound(strURL) {
    try {
        var m = getObjByName("cacheflash", document);
        m.SetVariable("strPlaySoundURL", strURL);
        //alert('playing ' + strURL);
    }
    catch (ex) { }

}
function stopSound() {
    try {
        var m = getObjByName("cacheflash", document);
        m.SetVariable("strPlaySoundURL", "STOP");
    }
    catch (ex) { }
}





//scorm/aicc api interface layer
var findAPITries = 0;
var gblSCORMVersion = null;
var isSCORM_1_2 = false;
function findAPI(win) {
    // Check to see if the window (win) contains the API
    // if the window (win) does not contain the API and
    // the window (win) has a parent window and the parent window
    // is not the same as the window (win)
    while ((win.API == null) &&
            (win.API_1484_11 == null) &&
            (win.parent != null) &&
            (win.parent != win)) {
        // increment the number of findAPITries
        findAPITries++;
        // Note: 7 is an arbitrary number, but should be more than sufficient
        if (findAPITries > 7) {
            alert("Error finding API -- too deeply nested.");
            return null;
        }

        // set the variable that represents the window being
        // being searched to be the parent of the current window
        // then search for the API again
        win = win.parent;
    }
    if (win.API_1484_11 != null) {
        gblSCORMVersion = "SCORM 2004";
        return win.API_1484_11;
    }
    if (win.API != null) {
        isSCORM_1_2 = true;
        gblSCORMVersion = "SCORM 1.2";
        return win.API;
    }
    return null;
}

function getAPI() {
    if (gblSCORMAPI != null) return gblSCORMAPI;
    var theAPI = null;
    try {
        // start by looking for the API in the current window
        var theAPI = findAPI(window);
        // if the API is null (could not be found in the current window)
        // and the current window has an opener window
        if ((theAPI == null) &&
             (window.opener != null) &&
             (typeof (window.opener) != "undefined")) {

            // try to find the API in the current window's opener
            theAPI = findAPI(window.opener);
        }
        // if the API has not been found
        /*if (theAPI == null)
        {
           // Alert the user that the API Adapter could not be found
           alert("Unable to find an API adapter");
        }*/
    }
    catch (ex) { }
    return theAPI;
}


var gblSCORMAPI;// = getAPI();

function getIsSCORM() {
    return (gblSCORMAPI != null);
}

function LMSInitialize() {
    //the parameter is unused - reserved by SCORM for future use
    if (isSCORM_1_2) {
        return gblSCORMAPI.LMSInitialize("");
    }
    else
        return gblSCORMAPI.Initialize("");
}

function LMSFinish() {
    //the parameter is unused - reserved by SCORM for future use
    if (isSCORM_1_2)
        return gblSCORMAPI.LMSFinish("");
    else
        return gblSCORMAPI.Terminate("");
}

function LMSGetValue(parameter) {
    if (isSCORM_1_2)
        return gblSCORMAPI.LMSGetValue(parameter);
    else
        return gblSCORMAPI.GetValue(parameter);
}

function LMSSetValue(parameter, value) {
    if (isSCORM_1_2)
        return gblSCORMAPI.LMSSetValue(parameter, value);
    else
        return gblSCORMAPI.SetValue(parameter, value);
}

function LMSCommit() {
    //the parameter is unused - reserved by SCORM for future use
    if (isSCORM_1_2)
        return gblSCORMAPI.LMSCommit("");
    else
        return gblSCORMAPI.Commit("");
}


//scorm/aicc api - udutu interface
function getBookmark() {
    var intScreenID;
    if (isSCORM_1_2) {
        intScreenID = LMSGetValue("cmi.core.lesson_location");
        if (intScreenID == "" || intScreenID == null) {
            intScreenID = -1;
        }
    }
    else {
        intScreenID = LMSGetValue("cmi.location"); //scorm 2004 (must do it both ways since a couple of clients have hybrid scorm2004/scorm 1.2 implementations)
        if (intScreenID == "" || intScreenID == null)
            intScreenID = -1;
    }
    return intScreenID;
}

function getLearnerName() {
    if (getIsSCORM()) {
        if (isSCORM_1_2) {
            return LMSGetValue("cmi.core.student_name");
        }
        else {
            return LMSGetValue("cmi.learner_name");
        }
    }
    return "Learner Name not found";
}

function getLearnerID() {
    if (getIsSCORM()) {
        if (isSCORM_1_2) {
            return LMSGetValue("cmi.core.student_id");
        }
        else {
            return LMSGetValue("cmi.learner_id");
        }
    }
    return "Learner Name not found";
}

function setBookmark(intScreenID) {
    var Screen = getCurrScreen();
    if (!Screen.parentModule.isResource) {
        if (isSCORM_1_2)
            LMSSetValue("cmi.core.lesson_location", intScreenID);
        else
            LMSSetValue("cmi.location", intScreenID); //scorm 2004	
    }
}


function setCompleted() {
    if (isSCORM_1_2)
        LMSSetValue("cmi.core.lesson_status", "completed");
    else {
        LMSSetValue("cmi.completion_status", "completed"); //scorm 2004
        setSuccessStatus();
    }
}

function setIncomplete() {
    if (isSCORM_1_2)
        LMSSetValue("cmi.core.lesson_status", "incomplete");
    else
        LMSSetValue("cmi.completion_status", "incomplete"); //scorm 2004
}
var gblPassingScore = 0.50;
function setSuccessStatus() {

    var rawScore = 0;
    var maxScore = 0;
    for (var i = 0; i < gblScreens.length; i++) {
        if (gblScreens[i].active) {
            if (gblScreens[i].score > 0) {
                rawScore += parseInt(gblScreens[i].score);
            }
            maxScore += gblScreens[i].maxscore;
        }
    }
    var success_status = "passed";
    if (maxScore > 0) {
        if (rawScore / maxScore < gblPassingScore)
            success_status = "failed";
    }
    LMSSetValue("cmi.success_status", success_status); //scorm 2004

}
function setLogout() {
    if (gblCourse.completed) {

        if (top.window == window) {
            if (isSCORM_1_2)
                LMSSetValue("cmi.core.exit", "exit");
            else
                LMSSetValue("cmi.exit", "exit"); //scorm 2004
        }
        else {
            if (isSCORM_1_2) {
                LMSSetValue("adl.nav.request", "exit");
                LMSSetValue("cmi.core.exit", "exit");
                //LMSSetValue("adl.nav.request", "suspendAll");
            }
            else {
                LMSSetValue("adl.nav.request", "exit");
                LMSSetValue("cmi.exit", "exit"); //scorm 2004
                //LMSSetValue("adl.nav.request", "suspendAll");

            }
        }
    }
    else {
        if (top.window == window) {
            if (isSCORM_1_2)
                LMSSetValue("cmi.core.exit", "suspend");
            else
                LMSSetValue("cmi.exit", "suspend"); //scorm 2004
        }
        else {
            if (isSCORM_1_2) {
                LMSSetValue("adl.nav.request", "exit");
                LMSSetValue("cmi.core.exit", "suspend");
                //LMSSetValue("adl.nav.request", "suspendAll");
            }
            else {
                LMSSetValue("adl.nav.request", "exit");
                LMSSetValue("cmi.exit", "suspend"); //scorm 2004
                //LMSSetValue("adl.nav.request", "suspendAll");

            }
        }
    }
}

var arrInteractions = new Array();
var arrPreviousSessionInteractions = new Array();
//var prevSessionInteractionCount = 0;
function getInteractionIndex(id) {
    for (var i = 0; i < arrInteractions.length; i++) {
        if (id == arrInteractions[i].id)
            return i;
    }
    return -1;
}
function initInteraction(toArr, id, result, description, correct_response, learner_response, type) {
    this.id = id;
    //this.screen = getScreenByScreenID(id);
    //this.screen.currInteraction = this;
    this.result = result;
    this.description = description;
    this.type = type;
    this.correct_response = correct_response;
    this.learner_response = learner_response;
    toArr[toArr.length] = this;
    this.index = toArr.length - 1;
}

//our application uses a journaling scheme to keep track of interactions so that
//results from previous sessions are not overwritten.  the length of the array
//is set so that the first n entries are null, where n is the number of interaction
//results stored from previous sessions.  the SCORM specification allows for this
function loadInteractions() {
    var intArrLen = LMSGetValue('cmi.interactions._count');
    if (intArrLen != null && intArrLen > 0) {
        //arrPreviousSessionInteractions.length = intArrLen;
        for (i = 0; i < intArrLen; i++) {
            var id = LMSGetValue('cmi.interactions.' + i + '.id');
            if (id != null && id != '') {
                var result = LMSGetValue('cmi.interactions.' + i + '.result');
                var description = LMSGetValue('cmi.interactions.' + i + '.description');
                var type = LMSGetValue('cmi.interactions.' + i + '.type');
                var correct_response = LMSGetValue('cmi.interactions.' + i + '.correct_responses.0.pattern');
                var learner_response = LMSGetValue('cmi.interactions.' + i + '.learner_response');
                var interaction = new initInteraction(arrPreviousSessionInteractions, id, result, description, correct_response, learner_response, type);
            }
        }
    }
}

function resetCourse(ignoreCorrect) {
    //if (evaluateCourseCompletion())
    if (true) {

        var arrCorrectInteractions = new Array();
        if (ignoreCorrect) {
            //copy all correct responses to a fresh array
            for (var i = 0; i <= arrInteractions.length - 1; i++) {
                if (arrInteractions[i].result == 'correct') {
                    arrCorrectInteractions[arrCorrectInteractions.length] = arrInteractions[i];
                }
            }

            for (var i = 0; i <= arrPreviousSessionInteractions.length - 1; i++) {
                if (arrPreviousSessionInteractions[i].result == 'correct') {
                    arrCorrectInteractions[arrCorrectInteractions.length] = arrPreviousSessionInteractions[i];
                }
            }
        }
        if (gblSCORMAPI != null) {
            for (var i = 0; i <= arrInteractions.length - 1; i++) {//null out the current session interactions
                //if (arrPreviousSessionInteractions[i].id == interactionID)
                //return arrPreviousSessionInteractions[i];
                var intSCORMindex = i + arrPreviousSessionInteractions.length;

                LMSSetValue('cmi.interactions.' + intSCORMindex + '.id', 0);
                if (arrInteractions[intSCORMindex].type == null) arrInteractions[intSCORMindex].type = 'choice';
                LMSSetValue('cmi.interactions.' + intSCORMindex + '.type', arrInteractions[intSCORMindex].type);
                LMSSetValue('cmi.interactions.' + intSCORMindex + '.result', arrInteractions[intSCORMindex].result);
                LMSSetValue('cmi.interactions.' + intSCORMindex + '.description', arrInteractions[intSCORMindex].description);
                //assume interaction is a mult-choice for now (this will change)

                if (correct_response != null)
                    LMSSetValue('cmi.interactions.' + intSCORMindex + '.correct_responses.0.pattern', arrInteractions[intSCORMindex].correct_response);
                if (learner_response != null)
                    LMSSetValue('cmi.interactions.' + intSCORMindex + '.learner_response', arrInteractions[intSCORMindex].learner_response);

            }
        }

        arrInteractions = new Array();
        if (gblSCORMAPI != null) {
            for (var i = 0; i <= arrPreviousSessionInteractions.length - 1; i++) {//null out previous session interactions
                //if (arrPreviousSessionInteractions[i].id == interactionID)
                //return arrPreviousSessionInteractions[i];

                LMSSetValue('cmi.interactions.' + i + '.id', 0);
                if (arrPreviousSessionInteractions[i].type == null) arrPreviousSessionInteractions[i].type = 'choice';
                LMSSetValue('cmi.interactions.' + i + '.type', arrPreviousSessionInteractions[i].type);
                LMSSetValue('cmi.interactions.' + i + '.result', arrPreviousSessionInteractions[i].result);
                LMSSetValue('cmi.interactions.' + i + '.description', arrPreviousSessionInteractions[i].description);
                //assume interaction is a mult-choice for now (this will change)

                if (correct_response != null)
                    LMSSetValue('cmi.interactions.' + i + '.correct_responses.0.pattern', arrPreviousSessionInteractions[i].correct_response);
                if (learner_response != null)
                    LMSSetValue('cmi.interactions.' + i + '.learner_response', arrPreviousSessionInteractions[i].learner_response);

            }
        }
        arrPreviousSessionInteractions = new Array();

        if (ignoreCorrect != true) {
            var scrCount = gblScreens.length;
            var maxCount = scrCount;
            for (var i = 0; i < scrCount; i++) {
                if (gblScreens[i].active) {
                    gblScreens[i].visited = false;
                    if (gblScreens[i].score == 1)
                        gblScreens[i].score = 0;
                }
            }
        }
        else {
            //add the correct responses back into the system.
            //var totalSCORMLenth
            arrInteractions = arrCorrectInteractions;
            if (gblSCORMAPI != null) {
                for (var i = 0; i <= arrInteractions.length - 1; i++) {


                    var intSCORMindex = i;
                    LMSSetValue('cmi.interactions.' + intSCORMindex + '.id', arrInteractions[i].id);
                    if (type == null) type = 'choice';
                    LMSSetValue('cmi.interactions.' + intSCORMindex + '.type', arrInteractions[i].type);
                    LMSSetValue('cmi.interactions.' + intSCORMindex + '.result', arrInteractions[i].result);
                    LMSSetValue('cmi.interactions.' + intSCORMindex + '.description', arrInteractions[i].description);
                    //assume interaction is a mult-choice for now (this will change)

                    if (correct_response != null)
                        LMSSetValue('cmi.interactions.' + intSCORMindex + '.correct_responses.0.pattern', arrInteractions[i].correct_response);
                    if (learner_response != null)
                        LMSSetValue('cmi.interactions.' + intSCORMindex + '.learner_response', arrInteractions[i].learner_response);
                    //saveProgress(true);
                }
            }
        }
        saveProgress(true);
    }
}


function getAllScoresByModule(forModule) {
    var retScores = '';
    for (var i = 0; i < forModule.moduleObjects.length; i++) {

        var mo = currModule.moduleObjects[i];
        if (forModule.moduleObjects[i].type == "module") {
            var tmpScores = getAllScoresByModule(forModule.moduleObjects[i]);
            if (tmpScores != '') {
                retScores += tmpScores + ",";
            }
        }
        else if (forModule.moduleObjects[i].type == "screen") {
            if (forModule.moduleObjects[i].active) {
                if (forModule.moduleObjects[i].isScored) {
                    retScores += forModule.moduleObjects[i].score + ",";
                }
            }
        }
    }
    if (retScores != '') {
        retScores = retScores.substring(0, retScores.length - 1);
    }
    return retScores;
}

function getAllScoresByCurrModule() {
    var rawScore = 0;
    var maxScore = 0;
    var currScreen = getCurrScreen();
    var currModule = currScreen.parentModule;
    return getAllScoresByModule(currModule);
}

function searchLastInteractionResult(interactionID) {
    for (var i = 0; i <= arrInteractions.length - 1; i++) {
        if (arrInteractions[i].id == interactionID)
            return arrInteractions[i];
    }
    for (var i = 0; i <= arrPreviousSessionInteractions.length - 1; i++) {
        if (arrPreviousSessionInteractions[i].id == interactionID)
            return arrPreviousSessionInteractions[i];
    }
    return null;
}
function setCurrScreenInteractionDescription(description) {
    var currScreen = getCurrScreen();
    var intArrIndex = getInteractionIndex(currScreen.id);
    var interaction;
    if (intArrIndex >= 0) {
        interaction = arrInteractions[intArrIndex];
        interaction.description = description;
        if (gblSCORMAPI != null) {
            var intSCORMindex = intArrIndex + arrPreviousSessionInteractions.length;

            LMSSetValue('cmi.interactions.' + intSCORMindex + '.description', description);
            //assume interaction is a mult-choice for now (this will change)
            //saveProgress(true);
        }
    }

}
function setInteractionStatus(id, result, description, correct_response, learner_response, type) {

    var intArrIndex = getInteractionIndex(id);
    var interaction;
    if (intArrIndex >= 0) {
        interaction = arrInteractions[intArrIndex];
        interaction.learner_response = learner_response;
        interaction.result = result;
    }
    else {
        interaction = new initInteraction(arrInteractions, id, result, description, correct_response, learner_response, type);
        intArrIndex = arrInteractions.length - 1;
    }
    if (gblSCORMAPI != null) {
        var intSCORMindex = intArrIndex + arrPreviousSessionInteractions.length;
        LMSSetValue('cmi.interactions.' + intSCORMindex + '.id', id);
        if (type == null) type = 'choice';
        LMSSetValue('cmi.interactions.' + intSCORMindex + '.type', type);
        LMSSetValue('cmi.interactions.' + intSCORMindex + '.result', result);
        LMSSetValue('cmi.interactions.' + intSCORMindex + '.description', description);
        //assume interaction is a mult-choice for now (this will change)

        if (correct_response != null)
            LMSSetValue('cmi.interactions.' + intSCORMindex + '.correct_responses.0.pattern', correct_response);
        if (learner_response != null)
            LMSSetValue('cmi.interactions.' + intSCORMindex + '.learner_response', learner_response);
        saveProgress(true);
    }
}

function setProgressMeasure() {
    if (isSCORM_1_2) {
    }
    else {
        if (gblCourse.completed == 'true') {
            LMSSetValue('cmi.progress_measure', 1);
        }
        else {
            var modCount = gblModules.length;
            var completedCount = 0;
            if (modCount > 1) {
                var maxCount = modCount;
                for (var i = 0; i < modCount; i++) {
                    if (gblModules[i].active) {
                        if (gblModules[i].completed)
                            completedCount++;
                    }
                    else {
                        maxCount--;
                    }
                }
                LMSSetValue('cmi.progress_measure', Math.round((completedCount / maxCount) * 100) / 100);
            }
            else {
                var scrCount = gblScreens.length;
                var maxCount = scrCount;
                for (var i = 0; i < scrCount; i++) {
                    if (gblScreens[i].active) {
                        if (gblScreens[i].isCompleted() == true)
                            completedCount++;
                    }
                    else {
                        maxCount--;
                    }
                }
                if (scrCount == 0)
                    LMSSetValue('cmi.progress_measure', Math.round((completedCount / maxCount) * 100) / 100);
                else
                    LMSSetValue('cmi.progress_measure', Math.round((completedCount / maxCount) * 100) / 100);
            }
        }
    }
}

function getSuspendData() {
    var tmp = LMSGetValue("cmi.suspend_data");
    if (tmp == null) tmp = '';
    return tmp;
}

function setSuspendData(parameter) {
    parameter += "~" + gblSeed;
    //lert("SAVE: gblSeed = " + gblSeed);
    LMSSetValue("cmi.suspend_data", parameter);
}


//returns bookmarked screenid
function initSCORM() {
    if (gblSCORMAPI != null) {
        LMSInitialize();
        initSeed();
        //go to the last page the student was on
        var intScreenID = getBookmark();
        if (intScreenID > 0) {
            //gblStartOnMainMenu = false;	
            for (var i = 0; i < gblScreens.length; i++) {
                if (gblScreens[i].id == intScreenID) {
                    setCurrScreen(gblScreens[i]);
                    //gblPreviousScreen = getPreviousScreen();
                    //gblNextScreen = getNextScreen();
                    break;
                }
            }
        }
        else
            initStartPage();
        //load the visited screens
        var suspendData = getSuspendData();
        var arrSUSPEND_DATA = suspendData.split(',');
        if (arrSUSPEND_DATA.length > 0) {
            //assume the screens in the list will be in order, so flagging
            //a screen as being completed will be quick
            var currSuspendIndex = 0;
            for (var i = 0; i < gblScreens.length; i++) {
                var tmpScreen = gblScreens[i];
                //if the ids match, flag the screen as completed, and increment the suspendindex
                //to try and match against the next screen in the list
                if (currSuspendIndex < arrSUSPEND_DATA.length) {
                    if (arrSUSPEND_DATA[currSuspendIndex] == tmpScreen.id) {
                        tmpScreen.completed = true;
                        if (tmpScreen.completesParent) {
                            var mod = tmpScreen.parentModule;
                            mod.completed = true;
                            setModuleCompleted(mod);
                        }
                        currSuspendIndex++;
                    }
                    else {
                        var arrSUSPEND_EL = arrSUSPEND_DATA[currSuspendIndex].split(':');

                        if (arrSUSPEND_EL[0] == tmpScreen.id) {
                            tmpScreen.completed = true;
                            if (tmpScreen.completesParent) {
                                var mod = tmpScreen.parentModule;
                                mod.completed = true;
                                setModuleCompleted(mod);
                            }
                            currSuspendIndex++;
                            if (arrSUSPEND_EL.length > 1) {
                                tmpScreen.score = arrSUSPEND_EL[1];
                            }

                        }
                    }
                }
            }
        }
        loadInteractions();
        return intScreenID;
    }
}

function saveScore() {
    var rawScore = 0;
    var maxScore = 0;
    for (var i = 0; i < gblScreens.length; i++) {
        if (gblScreens[i].active) {
            if (gblScreens[i].score > 0) {
                rawScore += parseInt(gblScreens[i].score);
            }
            maxScore += gblScreens[i].maxscore;
        }

    }
    if (maxScore > 0) {
        if (isSCORM_1_2) {
            LMSSetValue('cmi.core.score.min', 0);
            LMSSetValue('cmi.core.score.raw', Math.round((rawScore / maxScore) * 100));
            LMSSetValue('cmi.core.score.max', 100);

        }
        else {
            LMSSetValue('cmi.score.min', 0);
            LMSSetValue('cmi.score.raw', Math.round((rawScore / maxScore) * 100));
            LMSSetValue('cmi.score.max', 100);
            LMSSetValue('cmi.score.scaled', (Math.round((rawScore / maxScore) * 100)) / 100);
        }
    }
}

function generateScore() {
    var rawScore = 0;
    var maxScore = 0;
    for (var i = 0; i < gblScreens.length; i++) {
        if (gblScreens[i].active) {
            if (gblScreens[i].score > 0) {
                rawScore += parseInt(gblScreens[i].score);
            }
            maxScore += gblScreens[i].maxscore;
        }

    }
    if (maxScore > 0) {
        return ((rawScore / maxScore) * 100);
    }
    else
        return 0;
}

function generateMaxScore() {
    var rawScore = 0;
    var maxScore = 0;
    for (var i = 0; i < gblScreens.length; i++) {
        if (gblScreens[i].active) {
            if (gblScreens[i].score > 0) {
                rawScore += parseInt(gblScreens[i].score);
            }
            maxScore += gblScreens[i].maxscore;
        }

    }
    if (maxScore > 0) {
        return maxScore;
    }
    else
        return 0;
}
function generateRawScore() {
    var rawScore = 0;
    var maxScore = 0;
    for (var i = 0; i < gblScreens.length; i++) {
        if (gblScreens[i].active) {
            if (gblScreens[i].score > 0) {
                rawScore += parseInt(gblScreens[i].score);
            }
            maxScore += gblScreens[i].maxscore;
        }

    }
    if (maxScore > 0) {
        return rawScore
    }
    else
        return 0;
}

function saveProgress(blnCommit) {
    if (gblSCORMAPI != null) {
        gblCourse.completed = evaluateCourseCompletion();
        if (gblCourse.completed)
            setCompleted();
        else
            setIncomplete();
        var currScreen = getCurrScreen();
        setBookmark(currScreen.id);

        var strSuspendData = "";
        for (var i = 0; i < gblScreens.length; i++) {
            if (gblScreens[i].isCompleted() && gblScreens[i].parentModule.rootModuleIsResource != true) {
                if (strSuspendData != "")
                    strSuspendData += ",";
                strSuspendData += gblScreens[i].id;
                if (gblScreens[i].score > -1)
                    strSuspendData += ":" + gblScreens[i].score;

            }
        }
        setSuspendData(strSuspendData);
        setProgressMeasure();
        saveScore();
        if (blnCommit == true)
            LMSCommit();
        else if (currScreen.id % 5 == 0)
            LMSCommit();
    }
}

function doExitSCORM() {
    if (gblSCORMAPI != null) {
        var time = (new Date()).getTime();
        if (isSCORM_1_2) {
            LMSSetValue("cmi.core.session_time", formatTime(time - startTime));
        }
        else {
            LMSSetValue("cmi.session_time", formatTime(time - startTime));
        }
        saveProgress(true);
        setLogout();
        LMSFinish();
        gblSCORMAPI = null;

    }
}
var startDate = new Date();
var startTime = startDate.getTime();
//var finished=0;
//var student_id="";

function formatTime(timeDiff) {
    var hoursDifference = Math.floor(timeDiff / 1000 / 60 / 60);
    timeDiff = timeDiff - hoursDifference * 1000 * 60 * 60;
    var minutesDifference = Math.floor(timeDiff / 1000 / 60);
    timeDiff = timeDiff - minutesDifference * 1000 * 60;
    var secondsDifference = Math.floor(timeDiff / 1000);
    var hoursString;
    var minutesString;
    var secondsString;
    if (hoursDifference <= 9)
        hoursString = "0" + hoursDifference;
    else
        hoursString = "" + hoursDifference;
    if (minutesDifference <= 9)
        minutesString = "0" + minutesDifference;
    else
        minutesString = "" + minutesDifference;
    if (secondsDifference <= 9)
        secondsString = "0" + secondsDifference;
    else
        secondsString = "" + secondsDifference;
    return (hoursString + ':' +
          minutesString + ':' +
          secondsString);
}



/*
Array sort, search methods
*/

function partition(array, begin, end, pivot) {
    var piv = array[pivot].id;
    array.swap(pivot, end - 1);
    var store = begin;
    var ix;
    for (ix = begin; ix < end - 1; ++ix) {
        if (array[ix].id <= piv) {
            array.swap(store, ix);
            ++store;
        }
    }
    array.swap(end - 1, store);

    return store;
}

function compareIDs(el1, el2) {
    if (el1 > el2) return 1;
    if (el1 < el2) return -1;
    return 0;
}

Array.prototype.swap = function (a, b) {
    var tmp = this[a];
    this[a] = this[b];
    this[b] = tmp;
}

Array.prototype.binarySearch = function binarySearch(find) {
    var low = 0;
    var high = this.length - 1;
    var i, comparison;
    while (low <= high) {
        i = parseInt((low + high) / 2);
        comparison = compareIDs(this[i].id, find);
        if (comparison < 0) { low = i + 1; continue; };
        if (comparison > 0) { high = i - 1; continue; };
        return this[i];
    } rand
    return null;
};

function qsort(array, begin, end) {
    if (end - 1 > begin) {
        var pivot = begin + Math.floor(Math.random() * (end - begin));

        pivot = partition(array, begin, end, pivot);

        qsort(array, begin, pivot);
        qsort(array, pivot + 1, end);
    }
}

function quick_sort(array) {
    qsort(array, 0, array.length);
}

function sortScreens() {
    quick_sort(gblSortedScreens);
}


function getScreenByScreenID(intScreenID) {

    return gblSortedScreens.binarySearch(intScreenID);

}

/*function currScreenDesc()
{
  var curr = getCurrScreen();
  alert(getScreenByScreenID(curr.id).name);
}*/
