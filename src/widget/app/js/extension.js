// Elements
const preview = document.getElementsByClassName('preview');
const reset_checkbox = document.getElementById('checkbox');

const inv_preview = document.querySelector('#inv-preview');
const est_preview = document.querySelector('#est-preview');
const so_preview = document.querySelector('#sales-preview');
const po_preview = document.querySelector('#purchase-preview');

const inv_select = document.querySelector('#inv-select');
const est_select = document.querySelector('#est-select');
const so_select = document.querySelector('#sales-select');
const po_select = document.querySelector('#purchase-select');

// Config
const placeholders =['vl__utpsb_prefixformate','vl__utpsb_number_reset'];
const booksConnection = 'zohobookssettingsall';

let month = new Date().getMonth() + 1;
let year_4 = new Date().getFullYear();
let year_2 = new Date().getFullYear().toString().substr(-2);
let month_in_str = {
  '1': 'Jan',
  '2': 'Feb',
  '3': 'Mar',
  '4': 'Apr',
  '5': 'may',
  '6': 'Jun',
  '7': 'Jul',
  '8': 'Aug',
  '9': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec',
}

// dict  used to insert drop down

let date_format_view = {

  'MM-YYYY': month_in_str[month] + '-' + year_4 + '-',
  'MM-YY': month_in_str[month] + '-' + year_2 + '-',
  'YYYY-MM': year_4 + '-' + month_in_str[month] + '-',
  'YY-MM': year_2 + '-' + month_in_str[month] + '-',
  'mm-YYYY': month + '-' + year_4 + '-',
  'mm-YY': month + '-' + year_2 + '-',
  'YYYY-mm': year_4 + '-' + month + '-',
  'YY-mm': year_2 + '-' + month + '-',
  'YYYY': year_4 + '-',
  'YY': year_2 + '-',
  'MM': month_in_str[month] + '-',
  'mm': month + '-',
}

//Hash map for dict (dataPreview)

let dateFormats = [

  'MM-YYYY',
  'MM-YY',
  'YYYY-MM',
  'YY-MM',
  'mm-YYYY',
  'mm-YY',
  'YYYY-mm',
  'YY-mm',
  'YYYY',
  'YY',
  'MM',
  'mm',
]

//Update the data in drop-down

const append_drop_down = (select) => {
  for (let format in dateFormats) {
    option = document.createElement('option')
    option.value = dateFormats[format]
    option.text = option.value.charAt(0).toUpperCase() + option.value.slice(1)
    select.appendChild(option)
  }
}

append_drop_down(inv_select);
append_drop_down(est_select);
append_drop_down(so_select);
append_drop_down(po_select);


// display-preview

function load_format_preview(select,inputarea,preview,warning){

  select=document.getElementById(select).value;
  inputarea=document.getElementById(inputarea).value;
  preview = document.getElementById(preview);
  warning = document.getElementById(warning);

  if (select != "none") {

    preview.innerText = inputarea+"-"+date_format_view[select];

    if (preview.textContent.length>13) {

      preview.parentElement.classList.add('active');
      warning.classList.add('active');

    }
    else {

      preview.parentElement.classList.remove('active');
      warning.classList.remove('active');

    }
  }
 
}

window.onload = () => {

  ZFAPPS.extension.init().then(async (App) => {

    ZFAPPS.invoke('RESIZE', { width: '800px', height: '360px' });
    let { organization } = await ZFAPPS.get('organization');
    await load_placeholder(organization, placeholders[0]);
    await load_placeholder(organization,placeholders[1]);
    App.instance.on('ON_SETTINGS_WIDGET_PRE_SAVE', async() => {

      let excess_value_entity=[];  
      let empty_value_entity=[]
      for(let index=0; index<preview.length ; index++){
        let length = (preview[index].textContent).length;
        if(length==0){
          empty_value_entity.push(index);
        }
        else if(length>13){
          excess_value_entity.push(index);
        }
      }
      let empty_value_count = empty_value_entity.length;
      let excess_value_count = excess_value_entity.length;

      if(empty_value_count!=4){
        if(excess_value_count == 0){
          await load_the_field(organization);

        }
        else{
          alert ("Check the preview format not more than 13 character");
          return {
            "prevent_save": true
          };
        }
      }
      else{
        alert ("Atleast one entity you must filled ");
        return {
          "prevent_save": true
        };
      }
    })
  })
}

const load_the_field = async (organization) => {
  let entity = {
    Invoice: {
      Prefix: 'INV',
      Date: ' ',
    },
    Estimate: {
      Prefix: 'EST',
      Date: ' ',
    },
    SalesOrder: {
      Prefix: 'SO',
      Date: ' ',
    },
    PurchaseOrder: {
      Prefix: 'PO',
      Date: ' ',
    },
  }
  var checked = 'no'
  if (reset_checkbox.checked) {
    var checked = 'yes'
  }
  entity['Invoice'].Prefix = inv_preview.textContent.split('-')[0] || 'INV'
  entity['Invoice'].Date = inv_select.value
  entity['Estimate'].Prefix = est_preview.textContent.split('-')[0] || 'EST'
  entity['Estimate'].Date = est_select.value
  entity['SalesOrder'].Prefix = so_preview.textContent.split('-')[0] || 'SO'
  entity['SalesOrder'].Date = so_select.value
  entity['PurchaseOrder'].Prefix =po_preview.textContent.split('-')[0] || 'PO'
  entity['PurchaseOrder'].Date = po_select.value
            
  //update the values in placeholder
  await update_placeholder(organization,entity,placeholders[0]);
            
  //update the checkbox fields
  await update_placeholder(organization,checked,placeholders[1]);
}

// Api call to load the placeholder

const load_placeholder = async (organization, placeholder) => {

  const booksAPIPrefix = `https://books.zoho${ organization.data_center_extension || '.com' }/api/v3`;
  let globaldata = {
    url: booksAPIPrefix + '/settings/orgvariables/' + placeholder,
    method: 'GET',
    url_query: [
    {
      key: 'organization_id',
      value: organization.organization_id,
    },
    ],
    header: [{ key: 'Content-Type', value: 'application/json' }],
    connection_link_name: booksConnection,
  }
  try 
  {
    let checkbox_value; 
    let {data: { body } } = await ZFAPPS.request(globaldata);
    let { orgvariable: { value } } = JSON.parse(body);
    let {
      Invoice: { Prefix: inv_prefix, Date: inv_date_format },
      Estimate: { Prefix: est_prefix, Date: est_date_format },
      SalesOrder: { Prefix: so_prefix, Date: so_date_format },
      PurchaseOrder: { Prefix: po_prefix, Date: po_date_format },
    } = JSON.parse(value) || checkbox_value ;
        
    let inv_date = date_format_view[inv_date_format];

    if (inv_date  != undefined) {
      inv_preview.innerText = inv_prefix + '-' + inv_date;
      let index = dateFormats.indexOf(inv_date_format);
      inv_select.selectedIndex = index;
    }

    let est_date = date_format_view[est_date_format];

    if (est_date  != undefined) {
      est_preview.innerText = est_prefix + '-' + est_date;
      let index = dateFormats.indexOf(est_date_format);
      est_select.selectedIndex = index;
        
    }

    let so_date = date_format_view[so_date_format];

    if ( so_date  != undefined) {
      so_preview.innerText = so_prefix + '-' + so_date;
      let index = dateFormats.indexOf(so_date_format);
      so_select.selectedIndex = index;
    }

    let po_date = date_format_view[po_date_format];

    if (po_date != undefined) {
      po_preview.innerText = po_prefix + '-' + po_date
      let index = dateFormats.indexOf(po_date_format);
      po_select.select.selectedIndex = index;
    }

    if (checkbox_value=="yes"){
      reset_checkbox.checked= true;
    }

  } catch (err) {
    console.log(err);
  }
}

//api call for update the placeholder

const update_placeholder = async (organization, value, placeholder) => {
  var data = { value: value }
  const booksAPIPrefix = `https://books.zoho${ organization.data_center_extension || '.com' }/api/v3`;
  var options = {

    url: booksAPIPrefix+'/settings/orgvariables/' + placeholder,
    method: 'PUT',
    url_query: [
      {
        key: 'organization_id',
        value: organization.organization_id,
      },
    ],
    body: {
      mode: 'formdata',
      formdata: [
        {
          key: 'JSONString',
          value: JSON.stringify(data),
        },
      ],
    },
    connection_link_name: booksConnection,
  }
  try {
    let value = await ZFAPPS.request(options)
    console.log(value)
  } catch (err) {
    console.log(err)
  }
}
