     function getObjByName(name,doc) { 
var o = 0; 

if(!doc) doc = document; 
if(doc[name]) o=doc[name]; 

if(!document.all) 
{ 

return doc.getElementById(name); 
} 
if(document.all && doc.all[name]) 
{o=doc.all[name];} 
if(o){ 
if(!o.getElementsByTagName) o.getElementsByTagName = getElementsArray; 
return o; 
} 
if(document.layers) { 
for(var i=0;i < doc.layers.length;i++){ 
var lyrdoc = doc.layers[i].document; 

if(lyrdoc[name]) return lyrdoc[name]; 
   if(lyrdoc.layers.length > 0) { 
   var o = getObjByName(name,lyrdoc); 
   if(o) return o; 
   } 
} 
} 
return 0; 
} 
if(!document.getElementById) document.getElementById = getObjByName; 

// equivalent to the .Net string.format function 
function formatString (oSource, arrReplacements) 
{ 
sReturn = oSource; 

for (var i=0;i < arrReplacements.length; i++){ 
var re = eval('/\\{'+ i + '\\}/gi'); 
sReturn = sReturn.replace(re,  arrReplacements[i]); 
} 


return sReturn; 

} 


function embed(tag)
{
  document.write(tag);
}