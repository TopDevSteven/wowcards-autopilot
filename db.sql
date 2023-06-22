-- Tables for tekmetric

create table tekcustomer(
	id bigint primary key unique,
	firstName varchar(50),
	lastName varchar(50),
	email varchar(50),
	address1 varchar(50),
	address2 varchar(50),
	address_city varchar(50),
	address_state varchar(50),
	address_zip varchar(50),
	phone1 varchar(50),
	phone2 varchar(50),
	phone3 varchar(50),
	notes varchar(150),
	customerType_id bigint,
	customerType_code varchar(50),
	customerType_name varchar(50),
	contactFirstName varchar(50),
	contactLastName varchar(50),
	shopId bigint,
	okForMarketing boolean,
	createdDate date,
	updatedDate date,
	deletedDate date,
	birthday Date
)

create table tekrepairorder(
	id bigint primary key unique,
	customerid bigint,
	amountpaid bigint,
	totalsales bigint,
	posteddate date
)

create table tekjob (
	id bigint primary key unique,
	repairorderid bigint,
	vehicleid bigint,
	customerid bigint,
	name varchar(50),
	authorized boolean ,
	authorizedDate date,
	selected boolean,
	note text,
	cannedjobid bigint,
	jobcategoryname varchar(50),
	partstotal bigint,
	labortotal int,
	discounttotal int,
	feetotal int,
	subtotal int,
	archived boolean,
	createddate date,
	updateddate date,
	laborhours float,
	loggedHours float,
	sort int
)

create table tekshop (
    id bigint primary key unique,
    name varchar(50),
	phone varchar(50),
	email varchar(50),
	website varchar(50),
	status varchar(50)
)

create table tekemployee (
	id bigint primary key unique,
	type varchar(50),
	firstname varchar(50),
	lastname varchar(50),
	email varchar(50),
	address1 varchar(50),
	address2 varchar(50),
	city varchar(50),
	state varchar(50),
	zip varchar(50),
	fulladdress varchar(50),
	streetaddress varchar(50),
	shpid int
)

-- Tables for protractor

create table protractorcontact(
	id varchar(150) primary key unique,
	creationtime date,
	deletiontime date,
	lastmodifiedtime date,
	fileas varchar(100),
	nametitle varchar(50),
	nameprefix varchar(50),
	firstname varchar(50),
	middlename varchar(50),
	lastname varchar(50),
	shopname varchar(50),
	suffix varchar(50),
	addresstitle varchar(50),
	addressstreet varchar(150),
	addresscity varchar(50),
	addressprovince varchar(50),
	addresspostalcode varchar(50),
	addresscountry varchar(50),
	company varchar(50),
	phone1title varchar(50),
	phone1 varchar(50),
	phone2title varchar(50),
	phone2 varchar(50),
	emailtitle varchar(50),
	email varchar(50),
	marketingsource varchar(150),
	note varchar(150),
	nomessaging boolean,
	noemail boolean,
	nopostcard boolean
)

create table protractorserviceitem (
	id varchar(50) primary key unique,
	type varchar(50),
	lookup varchar (50),
	description varchar(100),
	usage int,
	productiondate date,
	note varchar(150),
	noemail boolean,
	nopostcard boolean,
	ownerid varchar(50),
	plateregistration varchar(150),
	vin varchar(50),
	unit varchar(50),
	color varchar(50),
	year int,
	make varchar(50),
	model varchar(50),
	submodel varchar(50),
	engine varchar(50)
)

create table protractorinvoice (
    id varchar(50) primary key unique,
    type varchar(50),
    scheduledtime date,
    promisedtime date,
    invoicetime date,
    contactid varchar(50),
    serviceitemid varchar(50),
	partstotal float,
	labortotal float,
	sublettotal float,
	nettotal float,
	grandtotal float,
	locationid varchar(50)
)

-- Tables for shopware

create table shopwareshop (
    id bigint primary key unique,
    name varchar(50),
    phone varchar(50),
    email varchar(50)
)

create table shopwarecustomer (
    id bigint primary key unique,
    created_at varchar(50),
    updated_at varchar(50),
    first_name varchar(50),
    last_name varchar(50),
    phone varchar(50),
    address varchar(50),
    city varchar(50),
    state varchar(50),
    zip varchar(50),
    customer_type varchar(50),
    okmarketing boolean,
	shopid int,
	originshopid int,
	tenant int
)

create table shopwarerepairorder (
    id int primary key unique,
    created_at timestamp,
    updated_at timestamp,
    number int,
    state varchar(50),
    customer_id bigint,
    part_discount_cents int,
    labor_discount_cents int,
    supply_fee_cents int,
    part_discount_percentage int,
    part_tax_rate float,
    labor_tax_rate float,
    sublet_tax_rate float,
    hazmat_tax_rate float
)

create table shopwarejob (
    id bigint primary key unique,
    title varchar(50),
    shopware_shopid bigint,
    created_at timestamp,
    updated_at timestamp
)
