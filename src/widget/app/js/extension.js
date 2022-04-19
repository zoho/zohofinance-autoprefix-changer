// Elements
const select = document.querySelectorAll('.select');
const select2 = document.querySelectorAll('.inputarea');
const preview = document.getElementsByClassName('preview');
const pluginpreview = document.querySelectorAll('.Pluginpreview');
const checkbox = document.getElementById("checkbox");

const inv_preview = document.querySelector('#inv-preview');
const est_preview = document.querySelector('#est-preview');
const so_preview = document.querySelector('#sales-preview');
const po_preview = document.querySelector('#purchase-preview');

const inv_select = document.querySelector('#inv-select');
const est_select = document.querySelector('#est-select');
const so_select  = document.querySelector('#sales-select');
const po_select  = document.querySelector('#purchase-select');

// Config

const global_field_Prefix_Formate = 'vl__utpsb_prefixformate';
const global_field_Number_Reset = 'vl__utpsb_number_reset';

const booksConnection = 'zohobookssettingsall';

let date;

// dict  used to insert drop down 

let datePreview=
    {
        'MM-YYYY':"Apr-2022-",
        'MM-YY':'Apr-22-',
        "YYYY-MM":"2022-Apr-",
        "YY-MM":"22-Apr-",
        "mm-YYYY":"11-2022-",
        "mm-YY":"11-22-",
        "YYYY-mm":"2022-11-",
        "YY-mm":"22-11-",
        "YYYY":"2022-",
        "YY":"22-",
        "MM":"Apr-",
        "mm":"11-",
    }

//Hash map for dict (dataPreview) 

let dateFormat=[

    { date:"MM-YYYY" },
    { date:"MM-YY"   },
    { date:"YYYY-MM" },
    { date:"YY-MM"   },
    { date:"mm-YYYY" },
    { date:"mm-YY"   },
    { date:"YYYY-mm" },
    { date:"YY-mm"   },
    { date:"YYYY"    },
    { date:"YY"      },
    { date:"MM"      },
    { date:"mm"      }

]

//Update the data in drop-down

let j=0
while(j<select.length){
    for(var i of dateFormat){
        option=document.createElement('option');
        option.value=i.date;
        option.text=option.value.charAt(0).toUpperCase()+option.value.slice(1);
        select[j].appendChild(option);
    }
    j++;
    
}

// display-preview 

function change(){
    
    let i=0;
    while(i<select2.length){
        let selector=select[i].options[select[i].selectedIndex];
        if(selector.value=='none'){
            i++;
        }
        else{

            date=datePreview[selector.value]
            preview[i].innerText= select2[i].value+"-" + date;
            console.log(preview[i].innerText);
            let id = pluginpreview[i].id;
            console.log(id);
            if((preview[i].innerText).length > 13){
               
                document.getElementById(id).classList.add("active");

                break;
            }
            else{
                document.getElementById(id).classList.remove("active");
            }
            i++;
        }

    }
}

// get the value of selected dropdown

const selecteddropdown =(select,value)=>{

    for (i=0;i<select.length;i++){
        if ( select[i].value == value) {
            select.selectedIndex=i;
            break;
        }
    }
}

window.onload = () => {
    ZFAPPS.extension.init().then( async() => {
        ZFAPPS.invoke('RESIZE', { width: '800px', height: '360px' });
        
        let { organization } = await ZFAPPS.get('organization');
        await getglobal(organization,global_field_single_line);
        let entity=
        {
            "Invoice": { 
                "Prefix" : "INV" , "Date": " "
            },
            "Estimate": { 
                "Prefix" : "EST" , "Date": " "
            },
            "SalesOrder":{ 
                "Prefix" : "SO" , "Date": " "
            }, 
            "PurchaseOrder":{
                "Prefix": "PO" ,"Date": " "
            }
        }

        hook = async(App) => {

            App.instance.on("ON_SETTINGS_WIDGET_PRE_SAVE", async() => {
                var checked = "no";
                if (checkbox.checked) {
                  var checked = "yes";
                }
                entity["Invoice"].Prefix = (inv_preview.textContent).split('-')[0] || "INV" ;
                entity['Invoice'].Date = inv_select.value;
                entity['Estimate'].Prefix =(est_preview.textContent).split('-')[0] || "EST";
                entity['Estimate'].Date = est_select.value ;
                entity['SalesOrder'].Prefix = (so_preview.textContent).split('-')[0] || "SO";
                entity['SalesOrder'].Date = so_select.value;
                entity['PurchaseOrder'].Prefix = (po_preview.textContent).split('-')[0] || "PO";
                entity['PurchaseOrder'].Date = po_select.value;
        
                await updateGlobalVariables(organization,entity,global_field_Prefix_Formate);
                await updateGlobalVariables(organization,checked,global_field_Number_Reset);
        
            });
        }
        
    });
   
}



// Api call to get the globalfields

const getglobal =async(organization,global_field_id) => {

    let inv_date;
    let po_date;
    let est_date;
    let so_date;

    let globaldata={
        url:
            "https://books.zoho.com/api/v3/settings/orgvariables/" +global_field_id,
        method:'GET',
        url_query:[
            {
                key:'organization_id',
                value:organization.organization_id,
            },
        ],
        header:[{"key":"Content-Type","value":"application/json"}],
        connection_link_name:booksConnection
    };
    try{
        let { data: { body } } = await ZFAPPS.request(globaldata);
        let { orgvariable: { value } } = JSON.parse(body);
        let { Invoice:{

            Prefix: inv_prefix ,Date: inv_date_format },
            Estimate: { Prefix: est_prefix , Date: est_date_format },
            SalesOrder:{ Prefix: so_prefix , Date: so_date_format }, 
            PurchaseOrder:{ Prefix: po_prefix, Date: po_date_format}
            
        }=JSON.parse(value);

        if ((inv_date = datePreview[inv_date_format])!=undefined) {

            inv_preview.innerText = inv_prefix+"-"+inv_date;
            selecteddropdown(inv_select,inv_date_format);

        }

        if ((est_date = datePreview[est_date_format])!=undefined) {

            est_preview.innerText = est_prefix + "-" + est_date;
            selecteddropdown(est_select,est_date_format);
        }

        if ((so_date = datePreview[so_date_format])!=undefined){

            so_preview.innerText =so_prefix + "-" + so_date;
            selecteddropdown(so_select,so_date_format);
        }

        if ((po_date = datePreview[po_date_format])!=undefined){

            po_preview.innerText = po_prefix + "-" + po_date;
            selecteddropdown(po_select,po_date_format);
        }

    }catch(err){
        console.log(err);
    }
}

//api call for update the global fields

const updateGlobalVariables = async(organization,value,global_field_id) => {

    var data = { value:value };
    var options = {
        url:
          "https://books.zoho.com/api/v3/settings/orgvariables/" + global_field_id,
        method: "PUT",
        url_query: [
          {
            key: "organization_id",
            value: organization.organization_id,
          },
        ],
        body: {
          mode: "formdata",
          formdata: [
            {
              key: "JSONString",
              value: JSON.stringify(data),
            },
          ],
        },
        connection_link_name: booksConnection
      };
      try{
          let value =await ZFAPPS.request(options);
          console.log(value);
      }catch(err){
          console.log(err);
    }

}
