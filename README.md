# zohofinance-autoprefix-changer

## Description

<p>The extension will help customers to automate the entity number like(Invoice, Estimate, PurchaseOrder , Sales Order) in transactions with variety of prefix pattern. It will help to create and filter out the month wise/year wise transaction as well.</p>

<p>In Zoho Books, the transaction number is not customizable with the month or year-wise format. Using our extension customers can customize the transaction number. .</p>

##### Components Used: :exclamation:

    Widgets - User Interface to configure the transaction number series.
    Global Field - To store transaction-specific pattern configuration.
    Global Field On Change Function - To update the transaction number series after changing global field value.
    Scheduler - Executes at the start of every month and automatically changes the record's prefix according to the current month and year.
    Connections -  To update the global field values from plugin configuration widget. 

## Development Process    
<p>This repository has the each components source codes. You can  explore it and you can try it on your organization.</p>

