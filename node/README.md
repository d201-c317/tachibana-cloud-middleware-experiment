## Classes

<dl>
<dt><a href="#Data">Data</a></dt>
<dd></dd>
<dt><a href="#Tool">Tool</a></dt>
<dd></dd>
<dt><a href="#Rabbit">Rabbit</a></dt>
<dd></dd>
<dt><a href="#App">App</a></dt>
<dd></dd>
</dl>

<a name="Data"></a>

## Data
**Kind**: global class  

* [Data](#Data)
    * [new Data()](#new_Data_new)
    * [.db()](#Data.db) ⇒ <code>Array</code>
    * [.getOneItem(id)](#Data.getOneItem) ⇒
    * [.addOneItem(object)](#Data.addOneItem) ⇒ <code>void</code>
    * [.setResult(object)](#Data.setResult)
    * [.setStatus(id, value)](#Data.setStatus) ⇒ <code>void</code>
    * [.reset()](#Data.reset) ⇒ <code>void</code>
    * [.getCounter()](#Data.getCounter) ⇒ <code>number</code>

<a name="new_Data_new"></a>

### new Data()
Database Emulation

<a name="Data.db"></a>

### Data.db() ⇒ <code>Array</code>
Get Database

**Kind**: static method of <code>[Data](#Data)</code>  
**Returns**: <code>Array</code> - database  
<a name="Data.getOneItem"></a>

### Data.getOneItem(id) ⇒
Get one item from database

**Kind**: static method of <code>[Data](#Data)</code>  
**Returns**: database item  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | job sequence |

<a name="Data.addOneItem"></a>

### Data.addOneItem(object) ⇒ <code>void</code>
Add one job to database

**Kind**: static method of <code>[Data](#Data)</code>  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>any</code> | Job object |

<a name="Data.setResult"></a>

### Data.setResult(object)
Store the result of the job.

**Kind**: static method of <code>[Data](#Data)</code>  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>any</code> | Result object |

<a name="Data.setStatus"></a>

### Data.setStatus(id, value) ⇒ <code>void</code>
Set the delivery status of the item.

**Kind**: static method of <code>[Data](#Data)</code>  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | Job seq |
| value | <code>any</code> | Delivery status |

<a name="Data.reset"></a>

### Data.reset() ⇒ <code>void</code>
Clear the Database

**Kind**: static method of <code>[Data](#Data)</code>  
<a name="Data.getCounter"></a>

### Data.getCounter() ⇒ <code>number</code>
Get Counter

**Kind**: static method of <code>[Data](#Data)</code>  
**Returns**: <code>number</code> - Database Counter Status  
<a name="Tool"></a>

## Tool
**Kind**: global class  

* [Tool](#Tool)
    * [new Tool()](#new_Tool_new)
    * [.uuid()](#Tool.uuid) ⇒ <code>string</code>

<a name="new_Tool_new"></a>

### new Tool()
Common Tools

<a name="Tool.uuid"></a>

### Tool.uuid() ⇒ <code>string</code>
UUID Generator

**Kind**: static method of <code>[Tool](#Tool)</code>  
**Returns**: <code>string</code> - UUID  
<a name="Rabbit"></a>

## Rabbit
**Kind**: global class  

* [Rabbit](#Rabbit)
    * [new Rabbit()](#new_Rabbit_new)
    * _instance_
        * [.writeMessage(msg)](#Rabbit+writeMessage) ⇒ <code>void</code>
        * [.receiveMessage()](#Rabbit+receiveMessage) ⇒ <code>void</code>
    * _static_
        * [.Rabbit](#Rabbit.Rabbit)
            * [new Rabbit()](#new_Rabbit.Rabbit_new)

<a name="new_Rabbit_new"></a>

### new Rabbit()
AMQP Access

<a name="Rabbit+writeMessage"></a>

### rabbit.writeMessage(msg) ⇒ <code>void</code>
Publish message

**Kind**: instance method of <code>[Rabbit](#Rabbit)</code>  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>any</code> | message object |

<a name="Rabbit+receiveMessage"></a>

### rabbit.receiveMessage() ⇒ <code>void</code>
message receiver

**Kind**: instance method of <code>[Rabbit](#Rabbit)</code>  
<a name="Rabbit.Rabbit"></a>

### Rabbit.Rabbit
**Kind**: static class of <code>[Rabbit](#Rabbit)</code>  
<a name="new_Rabbit.Rabbit_new"></a>

#### new Rabbit()
Creates an instance of Rabbit.

<a name="App"></a>

## App
**Kind**: global class  

* [App](#App)
    * [new App()](#new_App_new)
    * _instance_
        * [.start()](#App+start)
    * _static_
        * [.App](#App.App)
            * [new App(port)](#new_App.App_new)

<a name="new_App_new"></a>

### new App()
The API Core

<a name="App+start"></a>

### app.start()
Start the API

**Kind**: instance method of <code>[App](#App)</code>  
<a name="App.App"></a>

### App.App
**Kind**: static class of <code>[App](#App)</code>  
<a name="new_App.App_new"></a>

#### new App(port)
Creates an instance of API.


| Param | Type | Description |
| --- | --- | --- |
| port | <code>number</code> | Port No. |

