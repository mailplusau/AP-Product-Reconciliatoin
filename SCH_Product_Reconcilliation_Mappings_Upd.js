/**
 * Script Name : SCH_Product_Reconcilliation_Mappings_Updation
 * Author      : Shweta Chopde
 * Date        : 12 Jan 2017
 * Description : The script is designed to clear the data from field - AP Bill - AP Product Mapping whose AP BIll & AP Product Order are fully reconciled
 * 
 */
function schedulerFunction(type)
{
  try
  {
	var i_context = nlapiGetContext();

    var partnerID = i_context.getSetting('SCRIPT', 'custscript_id');
	
	var filter = new Array();
    if(_logValidation(partnerID)){
        filter[filter.length] = new nlobjSearchFilter('custrecord_partner_user', null, 'is', partnerID);
    }
    
    var columns = new Array();
    columns[0] = new nlobjSearchColumn('internalid');
    
    var	a_search_results = nlapiSearchRecord('customrecord_pr_mappings',null,filter,columns);	
    
    if(_logValidation(a_search_results))
	{
	  for(var i = 0  ;i<a_search_results.length ; i++)
	  {
		  var i_PR_ID = a_search_results[i].getValue('internalid');
    	  nlapiLogExecution('DEBUG', 'schedulerFunction',' Product Mappings ID ['+i+'] --->' +i_PR_ID);
    	  
    	  if(_logValidation(i_PR_ID))
		  {
		    var o_PR_OBJ = nlapiLoadRecord('customrecord_pr_mappings',i_PR_ID);
		    
		    if(_logValidation(o_PR_OBJ))
	    	{
		    	var a_bill_order_mappings_array = o_PR_OBJ.getFieldValue('custrecord_apbill_approduct_mappings');
		    	nlapiLogExecution('DEBUG', 'schedulerFunction',' Bill Order Mappings Array ['+i+'] --->' +a_bill_order_mappings_array);
		    	
		    	var getUnmatch_File = o_PR_OBJ.getFieldValue('custrecord_unmatching_csv_file');
		    	nlapiLogExecution('DEBUG', 'schedulerFunction',' custrecord_unmatching_csv_file ' +getUnmatch_File);
		    	
		    	 if(_logValidation(a_bill_order_mappings_array))
	    		 {
	    			var a_TT_array_values = new Array();	
	    			 var i_data_TT = new Array();
	    			 i_data_TT =  a_bill_order_mappings_array;
	    			 
	    			 if(_logValidation(i_data_TT))
	    			 {		  
	    			      for(var dt=0;dt<i_data_TT.length;dt++)
	    				  {
	    					 	a_TT_array_values = i_data_TT.split('][');
	    					    break;				
	    				  }						
	    			 }//Data TT	
	    			 
	    			 nlapiLogExecution('DEBUG', 'schedulerFunction',' TT Array Values --->' +a_TT_array_values);	 		    	
	    			 nlapiLogExecution('DEBUG', 'schedulerFunction',' TT Array Values Length ['+i+'] --->' +a_TT_array_values.length);
	 		    		    			
    				  if(_logValidation(a_TT_array_values))
    				  {
    					  var a_recon_array = new Array();
    					  
    						   for(var t_x = 0 ; t_x<a_TT_array_values.length ;t_x++)
    						   {
    						      var a_reconcile_array = a_TT_array_values[t_x];
    						      nlapiLogExecution('DEBUG', 'schedulerFunction','Reconcile Array ['+t_x+ '] -->' +a_reconcile_array);
    						   
    						      if(_logValidation(a_reconcile_array))
    					    	  {
    					    	    var a_split_rec_array = new Array();
    					    	    
    					    	    a_split_rec_array = a_reconcile_array.split('|');
    					    	    
    					    	    var i_bill_1_G     = a_split_rec_array[0];    					    	  
    					    	    var i_bill_2_G = a_split_rec_array[1];
    					    	    
    					    	    i_bill_1_G = i_bill_1_G.replace(/[^0-9]/g, "");	 
    					    	    i_bill_2_G = i_bill_2_G.replace(/[^0-9]/g, "");
    					    		 
    					    	    var f_is_bill_fully_reconciled = is_AP_Bill_fully_reconciled(i_bill_1_G);   
    					    	    var f_is_product_fully_reconciled  = is_AP_Product_Order_fully_reconciled(i_bill_2_G);
    					    	    
    					    	    
    					    	    nlapiLogExecution('DEBUG', 'schedulerFunction','AP BIll ['+t_x+ '] -->' +i_bill_1_G +' is fully reconciled ? '+f_is_bill_fully_reconciled);
    					    	    nlapiLogExecution('DEBUG', 'schedulerFunction','AP Product Order ['+t_x+ '] -->' +i_bill_2_G+' is fully reconciled ?'+f_is_product_fully_reconciled);
    	    					   
    					    	    if(f_is_bill_fully_reconciled == true && f_is_product_fully_reconciled == true)
					    	    	{
    					    	    	var s_str = '['+i_bill_1_G +'|'+ i_bill_2_G+']'
    					    	    	    					    	    	
    					    	    	a_recon_array.push(s_str);
					    	    	}    					   
    					    	  }
    						     }
    					        }
    				  
    				  
    				   	 nlapiLogExecution('DEBUG', 'schedulerFunction','****************  Reconcile Array **************** -->' +a_recon_array);
    					  
    			    	 if(_logValidation(a_recon_array))
    		    		 {
    		    		   for(var rc = 0 ;rc<a_recon_array.length ; rc++)
    	    			   {
    	    			     var s_str = a_recon_array[rc];
    	    			     
    	    			     a_bill_order_mappings_array = a_bill_order_mappings_array.replace(s_str, '');
    	    			 	
    	    			   }
    		    		   nlapiLogExecution('DEBUG', 'schedulerFunction','****************  a_bill_order_mappings_array **************** -->' +a_bill_order_mappings_array);
    						
    		    		 }		    	     
    			    	 
    			    	 
    			    	 // CODE TO REMOVE FULLY RECONCILED MAPPING FROM UNPATCH FILE 
    			    	 var s_unmatch_content = '';
    			    	 var a_recon_array_ = new Array()
    			    	 if(_logValidation(getUnmatch_File))
    			    	 {
    			    		 nlapiLogExecution('DEBUG', 'schedulerFunction','******* START getUnmatch_File ' +getUnmatch_File);
    			    		
    			    		 // GET THE UNMATCHED FILE DATA 
    			    		 var Obj_file = nlapiLoadFile(getUnmatch_File);
    			  		     var s_unmatch_content_string = Obj_file.getValue();
    			  		     s_unmatch_content = s_unmatch_content_string.toString(); 
    			  		     nlapiLogExecution('DEBUG', 'schedulerFunction','******* START s_unmatch_content ' +s_unmatch_content);
    			  		     if(_logValidation(s_unmatch_content))
			  		    	 {
    			  		    	 var s_unmatch_content_splitter = s_unmatch_content.toString().split('][');
    			  		    	nlapiLogExecution('DEBUG', 'schedulerFunction','******* START s_unmatch_content_splitter ' +s_unmatch_content_splitter);
    			  		    	nlapiLogExecution('DEBUG', 'schedulerFunction','******* START s_unmatch_content_splitter length ' +s_unmatch_content_splitter.length);
    			  		    	
    			  		    	 for(var i_unmatch=0;i_unmatch < s_unmatch_content_splitter.length; i_unmatch++)
			  		    	     {
    			  		    		 var s_unmatch = s_unmatch_content_splitter[i_unmatch] ;
    			  		    		 var g_unmatch = s_unmatch; 
    			  		    		 g_unmatch = g_unmatch.replace('[', "");
    			  		    		 g_unmatch = g_unmatch.replace(']', "");
    			  		    		 s_unmatch = s_unmatch.toString().split('|');
 									 var i_AP_bill = s_unmatch[0];
 									 var i_AP_Order = s_unmatch[6];
 									i_AP_bill = i_AP_bill.replace(/[^0-9]/g, "");	 
 									i_AP_Order = i_AP_Order.replace(/[^0-9]/g, "");
 
 									 var f_is_bill_fully_reconciled_ = is_AP_Bill_fully_reconciled(i_AP_bill);   
     					    	     var f_is_product_fully_reconciled_  = is_AP_Product_Order_fully_reconciled(i_AP_Order);
     					    	    //nlapiLogExecution('DEBUG', 'schedulerFunction','******* START f_is_bill_fully_reconciled_ ' +f_is_bill_fully_reconciled_);
        			  		    	//nlapiLogExecution('DEBUG', 'schedulerFunction','******* START f_is_product_fully_reconciled_ ' +f_is_product_fully_reconciled_);
        			  		    	
     					    	     // CHECK IF THE AP BILL AND AP ORDER ARE FULLY MAPPED 
     					    	     if(f_is_bill_fully_reconciled_ == true && f_is_product_fully_reconciled_ == true)
					    	    	 {
    					    	    	var s_str = '['+g_unmatch+']';
    					    	    	a_recon_array_.push(s_str);
					    	    	 }
			  		    	     } // END OF FOR LOOP 
			  		    	 } // END OF   if(_logValidation(s_unmatch_content))
    			  		     
    			  		     
    			  		     
    			  		     
    			  		     
    			    	 } // END OF  if(_logValidation(getUnmatch_File))
    			    	 nlapiLogExecution('DEBUG', 'schedulerFunction','******* START a_recon_array_ TO REPLACE  ' +a_recon_array_);
			  		    
    			    	 
    			    	 // REPLACE FULLY MAPPED WITH SPACE 
    			    	 if(_logValidation(a_recon_array_))
    		    		 {
    		    		   for(var rc_ = 0 ;rc_<a_recon_array_.length ; rc_++)
    	    			   {
    	    			     var s_str = a_recon_array_[rc_];
    	    			     s_unmatch_content = s_unmatch_content.replace(s_str, '');
    	    			 	
    	    			   }
    		    		   
    		    		 }
    			    	 
    			    	 nlapiLogExecution('DEBUG', 'schedulerFunction','******* AFTER REPLACE   a_recon_array_ TO REPLACE  ' +s_unmatch_content);
 			  		    
    			    	 
    			    	 // MAKE NOTEPAD FOR THE REMAINING CONTENT 
    			 		//if(_logValidation(s_unmatch_content))
    			 		{
    			 			var i_user = o_PR_OBJ.getFieldValue('custrecord_partner_user');
			 		    	var s_file_name = 'Unmatched AP Bill and Product Order_'+i_user+'.txt'					
			 				var file_obj = nlapiCreateFile(s_file_name, 'PLAINTEXT', s_unmatch_content.toString());
			 				file_obj.setFolder(1765674);
			 				var file_ID =  nlapiSubmitFile(file_obj);
			 				nlapiLogExecution('DEBUG', 'post_restlet_function', ' file_ID -->'+file_ID);
			 			    o_PR_OBJ.setFieldValue('custrecord_unmatching_csv_file',file_ID);
			 				
    			 		}
    			    	 
    			    	// if(_logValidation(a_bill_order_mappings_array))
			    		 {
			    		    o_PR_OBJ.setFieldValue('custrecord_apbill_approduct_mappings',a_bill_order_mappings_array);
			    		 }
    			    	
    			    	 var i_submitID = nlapiSubmitRecord(o_PR_OBJ,true,true);
    			    	 nlapiLogExecution('DEBUG', 'schedulerFunction','**************** Product Reconcilliation Mappings ID **************** -->'+i_submitID);
    					
    				  
    					} //Bill Mappings Array  
		    	 
		 	
	    	}//PR OBJ		  
		  }//Product Mappings ID	 
	  }//Search For Loop Results	
	}//Search Results	  
  }
  catch(exception)
  {
	nlapiLogExecution('DEBUG', 'ERROR', '  Exception Caught -->'+exception);
  }	




}//Scheduler Fumction



/** 
 * @param value
 * @returns
 */
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


function  is_AP_Bill_fully_reconciled(i_AP_Bill_ID)
{
   var result = false;
   
	if(_logValidation(i_AP_Bill_ID))
	{
	   var filter = new Array();
	   filter[0] = new nlobjSearchFilter('custrecord_ap_stock_recon_status', null, 'is', 1);
	   filter[1] = new nlobjSearchFilter('internalid', null, 'is', i_AP_Bill_ID);
	   
	   var columns = new Array();
	   columns[0] = new nlobjSearchColumn('internalid');
	  
	   var	a_search_results = nlapiSearchRecord('customrecord_mp_ap_stock_receipt',null,filter,columns);	
		
		if(_logValidation(a_search_results))
		{
		   for(var cn = 0 ;cn<a_search_results.length ;cn++)
		   {
			   var i_recordID = a_search_results[cn].getValue('internalid'); 
			   nlapiLogExecution('DEBUG', 'is_AP_Bill_fully_reconciled', '  AP Bill ID -->'+i_recordID);
			   result = true;
		   }//Loop Search Results		
		}//Search Results	
	}
	return result;
}//Is Fully Reconciled ?

function  is_AP_Product_Order_fully_reconciled(i_AP_Product_ID)
{
   var result = false;
   
	if(_logValidation(i_AP_Product_ID))
	{
	   var filter = new Array();
	   filter[0] = new nlobjSearchFilter('custrecord_ap_order_recon_status', null, 'is', 1);
	   filter[1] = new nlobjSearchFilter('internalid', null, 'is', i_AP_Product_ID);
	   
	   var columns = new Array();
	   columns[0] = new nlobjSearchColumn('internalid');
	  
	   var	a_search_results = nlapiSearchRecord('customrecord_mp_ap_product_order',null,filter,columns);	
		
		if(_logValidation(a_search_results))
		{
		   for(var cn = 0 ;cn<a_search_results.length ;cn++)
		   {
			   var i_recordID = a_search_results[cn].getValue('internalid'); 
			   nlapiLogExecution('DEBUG', 'is_AP_Product_Order_fully_reconciled', '  AP Product Order ID -->'+i_recordID);
			   result = true;
		   }//Loop Search Results		
		}//Search Results	
	}
	return result;
}//Is Fully Reconciled ?