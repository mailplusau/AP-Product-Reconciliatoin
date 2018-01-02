/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 May 2017     nagesh.kumbhar
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */

/** BEFORE SUBMIT FUNCTION **/
function userEventBeforeSubmit_Create_Mapping_dat(type)
{
	var rec_Type = nlapiGetRecordType();
	var rec_ID = nlapiGetRecordId();
	nlapiLogExecution('DEBUG', 'Record Type before submit', rec_Type);

	if(type == 'delete' && rec_Type == 'customrecord_product_reconciliation_data')
	{
        try
		{
        	 var rec_Obj = nlapiLoadRecord(rec_Type,rec_ID);
        	 var i_user = rec_Obj.getFieldValue('custrecord_prd_user');
        	 nlapiLogExecution('DEBUG', 'i_user customrecord_product_reconciliation_data ', 'i_user  '+i_user);
			  // CREATE RECONCILE DATA RECORDD
			  var new_rec_Obj = nlapiCreateRecord(rec_Type,{recordmode: 'dynamic'});
			  if(_logValidation(i_user))
				 {
				  var is_Inactive = nlapiLookupField('partner',i_user, 'isinactive');
				  if(is_Inactive == 'F')
			      {
					  new_rec_Obj.setFieldValue('custrecord_prd_user',i_user); // Set Current User
					  var i_submit_product_data = nlapiSubmitRecord(new_rec_Obj,true,true);
					  nlapiLogExecution('DEBUG', 'userEventBeforeSubmit_Create_Mapping_dat', 'customrecord_product_reconciliation_data  '+i_submit_product_data);
				   } 
				  }
			  }
		 catch(Exception)
		 {
			nlapiLogExecution('DEBUG', 'userEventBeforeSubmit_Create_Mapping_dat ','Exception-->'+Exception);
		 }
	  }	
	
	if(type == 'delete' && rec_Type == 'customrecord_pr_mappings')
	{
        try
		{
        	 var rec_Obj = nlapiLoadRecord(rec_Type,rec_ID);
        	 var i_user = rec_Obj.getFieldValue('custrecord_partner_user');
        	 nlapiLogExecution('DEBUG', 'i_user custrecord_partner_user ', 'i_user  '+i_user);
			 if(_logValidation(i_user))
			 {
				 var is_Inactive = nlapiLookupField('partner',i_user, 'isinactive');
				  if(is_Inactive == 'F')
			      {
				    // CREATE RECONCILE DATA RECORDD
	        	    var new_rec_Obj = nlapiCreateRecord(rec_Type,{recordmode: 'dynamic'});
	        	     new_rec_Obj.setFieldValue('custrecord_partner_user',i_user); // Set Current User
				     var i_submit_product_data = nlapiSubmitRecord(new_rec_Obj,true,true);
				    nlapiLogExecution('DEBUG', 'customrecord_pr_mappings ', 'customrecord_pr_mappings  '+i_submit_product_data);
			     }
			 }
				 
		 }
		 catch(Exception)
		 {
			nlapiLogExecution('DEBUG', 'customrecord_pr_mappings ','Exception-->'+Exception);
		 }
	  }	
}

/** END OF BEFORE SUBMIT FUNCTION **/



/** AFTER SUBMIT FUNCTION **/
function userEventAfterSubmit_Create_Mapping_data(type)
{
	var rec_Type = nlapiGetRecordType();
	var rec_ID = nlapiGetRecordId();
	nlapiLogExecution('DEBUG', 'Record Type', rec_Type);
	if(type == 'create' && rec_Type == 'partner')
	{
        try
		{
			  // CREATE RECONCILE MAPPING RECORD
			  var rec_ID = nlapiGetRecordId();
			  var o_product_mappingsOBJ = nlapiCreateRecord('customrecord_pr_mappings',{recordmode: 'dynamic'});
			  o_product_mappingsOBJ.setFieldValue('custrecord_partner_user',rec_ID);
			  var i_submit_product_mappingsID = nlapiSubmitRecord(o_product_mappingsOBJ,true,true);
			  nlapiLogExecution('DEBUG', 'post_restlet_function', 'Product Reconcilliation Mappings ID {CREATE}-->'+i_submit_product_mappingsID);
		  
			  // CREATE RECONCILE DATA RECORDD
			  rec_Obj = nlapiCreateRecord('customrecord_product_reconciliation_data',{recordmode: 'dynamic'});
			  rec_Obj.setFieldValue('custrecord_prd_user',rec_ID); // Set Current User
			  var i_submit_product_data = nlapiSubmitRecord(rec_Obj,true,true);
			  nlapiLogExecution('DEBUG', 'i_submit_product_data', 'i_submit_product_data '+i_submit_product_data);
		 }
		 catch(Exception)
		 {
			nlapiLogExecution('DEBUG', 'Exception','Exception-->'+Exception);
		 }
	  }	  
}

/** END OF AFTER SUBMIT FUNCTION **/









function _logValidation(value)
{
  if(value!=null && value!=undefined && value!='' && value!='NaN' && value!=' ')
  {
	  return true;
  }	 
  else	  
  {
	  return false;
  }
}
