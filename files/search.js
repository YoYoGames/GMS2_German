/*************************************************************************

    chm2web Search Library 2.7
    Copyright (c) 2002-2005 A!K Research Labs (http://www.aklabs.com)  
    http://chm2web.aklabs.com - HTML Help Conversion Utility

    Tested with: Internet Explorer 5, Opera 6, Mozilla 1.2, NN6

    ATTENTION! You can use this library only with web help system 
               generated by chm2web software.  
               
**************************************************************************/

$minchars = 3;


function ValidateRequest(s)
{
  regexp = /[^\w\s\u0080-\uFFFF]/g;
    
  res = s.match(regexp);
  if (res)
  {
    alert("Ungültiges Zeichen \"" + (res[0]) + "\" !");
    return false;
  }

  return true;
}

function Search(s)
{
  document.forms['searchform'].founddocslist.length = 0;

  if (!s || !ValidateRequest(s))
    return false;

  request = PrepareRequest(s).split("\x20");
  for (i=0; i<request.length; i++) {
   if (request[i].length<$minchars)
   {
     alert("Ihr Suchbegriff \"" + request[i] + "\" war zu kurz, bitte wählen Sie eine, die größer ist als " + $minchars + " Figuren.");
     return false;
   }
  }


  var docs = RecursiveSearch(0, true, []);
  if (!docs.length) { 
    var e = document.createElement("OPTION");
    e.text = "Keine Treffer gefunden!";
    e.value = "";
    document.forms['searchform'].founddocslist[0] = e;
  } else
    for (var i = 0; i < docs.length; i++)
    {
      var e = document.createElement("OPTION");
      e.text = SearchTitles[docs[i]];
      e.value = SearchFiles[docs[i]];
      document.forms['searchform'].founddocslist[document.forms['searchform'].founddocslist.length] = e;
    }
  return true;
}


var request = [];

var browser = "ie";
var bn=window.navigator.appName;
var ver=navigator.appVersion;

ver = parseFloat(ver.indexOf('MSIE') > 0 ? ver.split(';')[1].split(' ')[2] : ver.split(' ')[0]);

if (navigator.userAgent.indexOf('Opera') != -1 && ver >= 4)
  browser = "opera";
else
  if (bn.indexOf('Netscape') != -1)
    browser = "netscape";

function PrepareRequest(req)
{
  var regexp = /(\x20\x20)/g;
  while (req.match(regexp))
    req = req.replace(regexp, "\x20");
  
  regexp = /(^\x20)|(\x20$)/g;
  while (req.match(regexp))
    req = req.replace(regexp, "");
  return req;
}

function ANDarrays(a, b)
{
  var c = [];
  for (var i = 0; i < a.length; i++)
    for (var j = 0; j < b.length; j++)
      if (a[i] == b[j])
        c[c.length] = a[i];
  return c;
}

function ORarrays(a, b)
{
  var c = [];
  for (var i = 0; i < b.length; i++)
    c[i] = b[i];

  var f;
  for (var i = 0; i < a.length; i++)
  {
    f = false;
    for (var j = 0; j < b.length; j++)
    {
      if (a[i] == b[j])
      {
        f = true;
        break;
      }
    }
    if (!f)
      c[c.length] = a[i];
  }
  return c;
}

function RecursiveSearch(indx, action, resultsarr)
{
  if (indx == request.length)
    return resultsarr;

  if (request[indx] == "OR")
    return RecursiveSearch(indx + 1, false, resultsarr);
  else
    if (request[indx] == "AND")
      return RecursiveSearch(indx + 1, true, resultsarr);
    else {
      ok = false;
      temparr = [];
      for (var i = 0; i < SearchIndexes.length; i++) {
        if (SearchIndexes[i][0].substr(0, request[indx].length) == request[indx].toUpperCase())
        {
          temparr = ORarrays(temparr, SearchIndexes[i][1]);
        }      
       }

      if (temparr.length>0) {
          ok = true;
          if (action) // AND
            if (indx>0)  
              resultsarr = ANDarrays(resultsarr, temparr); 
             else
              resultsarr = ORarrays(resultsarr, temparr); 
          else // OR                     
            resultsarr = ORarrays(resultsarr, temparr); 
      }

      if (ok) return RecursiveSearch(indx + 1, true, resultsarr);
    }

  if (action) // AND
    return RecursiveSearch(indx + 1, true, resultsarr);
  else // OR
    return resultsarr;
}

var w = null; 

function Hilight() {
  if ((w.document.readyState != 'complete') && (w.document.readyState != 'loaded'))
      var t = setTimeout('Hilight()', 100);
  else {
    var dbody = w.document.body;
    var dbodyt = dbody.innerText;
    rngoff = 0;
    for (var r = 0; r < request.length; r++)
    if ((request[r] != "OR") && (request[r] != "AND"))
    {
       var rng = dbody.createTextRange();
       if (rng!=null) {
         for(var i=0; i<100; i++) {
           if (!rng.findText(request[r])) break;
           rng2 = rng.duplicate();
           rng2.moveStart("character", -1);

           charf = rng2.text.charAt(0);
           re = /[ \s\<\>\(\)\]\[\.\,\-\!\?]+/m; 
           if (charf.search(re)==0 || rng2.text==rng.text) 
             rng.pasteHTML("<span style='background-color:#FFFF00'>" + 
               rng.text + "</span>");
           rng.moveStart("word", 1);
         }
       } 
    }
  }
}

function OpenFoundDoc()
{
  w = open(document.forms['searchform'].founddocslist.options[document.forms['searchform'].founddocslist.selectedIndex].value, 'content');
  if(browser=='ie') 
    Hilight();
}

