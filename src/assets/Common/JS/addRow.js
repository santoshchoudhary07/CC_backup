function addRow(objTable) {
  /****************************************************************
  Version:
  ========
  1.0

  Created:
  =========
  04/04/2002 (brice)

  Input:
  =======
  objTable as TABLE Object

  Usage:
  =======
  Adds a Row to the end of the provided table based on the pre-defined
  "template" row (within the given table).

  Requirements:
  ==============
  There must be a TR with "id='template'" inside of the table - Use
  a stylesheet to hide: <Style> #template {display:none;} </Style>.

  Notes:
  ======
  This function DOES NOT use counters as in previous versions
  This function will simple ADD the exact template Over and Over, creating
  an Array for EACH field named in the template. It is up to the programmer
  to figure out what items are to be used or not.

  ** REMEMBER!!! checkboxes and optionButtons DO NOT SUBMIT IF NOT CHECKED!!! **

  If you want to check for "Delete" rows (for example), you must either set a
  value to the check box, or add a hidden field to flag the deletion.

  *****************************************************************/

  //var objTemplate = objTable.all("template");//find the template
  //var oTR = objTemplate.cloneNode(true);//make copy of template
  //objTable.tBodies(0).appendChild(oTR);//add copy to bottom of Table
  //oTR.id="";//remove "template" identifier

  //var oTable = document.all(objTable);
  //var oTemplate = oTable.all("template");
  //var oBody = oTable.tBodies[0];
  //var oNewRow = oTemplate.cloneNode(true);
  //oBody.appendChild(oNewRow);
  //oNewRow.style.display="block";
  //oNewRow.id="";//remove the named id

  //edit: 20090624 - create the copy and RETURN IT!!!
  //      - also, remove direct style manipulation
  //        instead use: <style> #template{display:none} </style>
  var objTemplate = objTable.all("template", 0); //find the template (first instance, if more than one)
  var oTR = objTemplate.cloneNode(true); //make copy of template
  //edit: 20160428 - changed tBodies collection indexer to use [] instead of () since Chrome got a case of the stupids
  objTable.tBodies[0].appendChild(oTR); //add copy to bottom of Table
  oTR.id = ""; //remove "template" identifier
  return (oTR); //return the new row (so that another process may continue using it
}