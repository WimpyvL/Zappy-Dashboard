-- Enable UUID generation if not already enabled (Supabase usually does this)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Tables without Foreign Keys first

-- Table: client_record
CREATE TABLE IF NOT EXISTS client_record (
	id VARCHAR(24) NOT NULL,
	related_tags VARCHAR(24)[],
	date_created TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	time_zone VARCHAR(50),
	user_id VARCHAR(24),
	user_email VARCHAR(255),
	first_name VARCHAR(50),
	last_name VARCHAR(50),
	email VARCHAR(255),
	mobile_phone VARCHAR(20),
	profile JSONB,
	is_child_record BOOLEAN NOT NULL,
	is_active BOOLEAN NOT NULL,
	invitation_sent BOOLEAN NOT NULL,
	status VARCHAR(50),
	record_created TIMESTAMP WITHOUT TIME ZONE,
	record_modified TIMESTAMP WITHOUT TIME ZONE,
	last_activity_date TIMESTAMP WITHOUT TIME ZONE,
	go_high_level_id VARCHAR(100),
	pro_rx_id VARCHAR(100),
	id_uploaded BOOLEAN,
	id_verification_reminder_sent_at TIMESTAMP WITHOUT TIME ZONE,
	phone_number_kc VARCHAR(20),
	blacklisted BOOLEAN,
	stripe_verification BOOLEAN,
	stripe_id VARCHAR(200),
	stripe_client_secret VARCHAR(200),
	PRIMARY KEY (id)
);

-- Table: tag
CREATE TABLE IF NOT EXISTS tag (
	id VARCHAR(36) NOT NULL,
	name VARCHAR(256) NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

-- Table: crisp_session
CREATE TABLE IF NOT EXISTS crisp_session (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	crisp_session_id VARCHAR,
	client_record_id VARCHAR(24),
	verified BOOLEAN,
	assigned_to_bot BOOLEAN,
	conversation_messages JSONB,
	conversation_processed BOOLEAN,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	valid_till TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

-- Table: session
CREATE TABLE IF NOT EXISTS session (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	client_record_id VARCHAR(24) NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	valid_till TIMESTAMP WITHOUT TIME ZONE,
	session_name VARCHAR(100),
	PRIMARY KEY (id)
);

-- Table: questionnaire
CREATE TABLE IF NOT EXISTS questionnaire (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	name VARCHAR(100) NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

-- Table: questionnaire_question
CREATE TABLE IF NOT EXISTS questionnaire_question (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	questionnaire_id UUID NOT NULL,
	question VARCHAR(255) NOT NULL,
	options JSONB,
	type VARCHAR(50) NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

-- Table: session_chat_history
CREATE TABLE IF NOT EXISTS session_chat_history (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	session_id UUID NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	value JSONB,
	questionnaire_question_id UUID,
	PRIMARY KEY (id),
	UNIQUE (questionnaire_question_id)
);

-- Table: message_store
CREATE TABLE IF NOT EXISTS message_store (
	id SERIAL NOT NULL,
	session_id TEXT NOT NULL,
	message JSON NOT NULL,
	PRIMARY KEY (id)
);

-- Table: user
CREATE TABLE IF NOT EXISTS "user" (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	user_name VARCHAR(50) NOT NULL,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
	email VARCHAR(100) NOT NULL,
	password VARCHAR(255) NOT NULL, -- Note: Supabase Auth handles password hashing separately
	phone_number VARCHAR(20),
	activation_status VARCHAR(100),
	pb_consultant_id VARCHAR(100),
	role VARCHAR(100),
	is_owner BOOLEAN DEFAULT 'false',
	is_practitioner BOOLEAN DEFAULT 'false',
	is_assistant BOOLEAN DEFAULT 'false',
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (user_name),
	UNIQUE (email),
	UNIQUE (pb_consultant_id)
);

-- Table: category
CREATE TABLE IF NOT EXISTS category (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	name VARCHAR(50) NOT NULL,
	keywords VARCHAR(50)[],
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

-- Table: intent
CREATE TABLE IF NOT EXISTS intent (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	question TEXT NOT NULL,
	category_id UUID NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

-- Table: knowledge_base
CREATE TABLE IF NOT EXISTS knowledge_base (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	question TEXT NOT NULL,
	answer TEXT NOT NULL,
	sub_category TEXT NOT NULL,
	category_id UUID NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

-- Table: knowledge_base_approval
CREATE TABLE IF NOT EXISTS knowledge_base_approval (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	question TEXT NOT NULL,
	answer TEXT NOT NULL,
	approved BOOLEAN NOT NULL,
	category_id UUID NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

-- Table: langchain_pg_collection
CREATE TABLE IF NOT EXISTS langchain_pg_collection (
	uuid UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	name VARCHAR NOT NULL,
	cmetadata JSON,
	PRIMARY KEY (uuid),
	UNIQUE (name)
);

-- Table: langchain_pg_embedding
CREATE TABLE IF NOT EXISTS langchain_pg_embedding (
	id VARCHAR NOT NULL, -- Consider changing to UUID if appropriate
	collection_id UUID NOT NULL,
	document VARCHAR,
	cmetadata JSON,
	PRIMARY KEY (id)
	-- Foreign key added later
);

-- Table: check_in
CREATE TABLE IF NOT EXISTS check_in (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	client_record_id VARCHAR(24) NOT NULL,
	date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	weight FLOAT,
	satisfaction INTEGER,
	medication VARCHAR(50),
	last_vial_used VARCHAR(100),
	adjusted_dose FLOAT,
	adjusted_units FLOAT,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

-- Table: test_session
CREATE TABLE IF NOT EXISTS test_session (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	verified BOOLEAN,
	user_id UUID NOT NULL,
	client_record_id VARCHAR(24),
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

-- Table: pb_packages
CREATE TABLE IF NOT EXISTS pb_packages (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	package_id VARCHAR(24) NOT NULL,
	user_id UUID,
	name VARCHAR(255),
	sku VARCHAR(255),
	is_shared BOOLEAN,
	is_subscription BOOLEAN,
	is_ongoing BOOLEAN,
	client_enrollment_enabled BOOLEAN,
	package_meta_data JSONB NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (package_id)
);

-- Table: packages
CREATE TABLE IF NOT EXISTS packages (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	pb_package_id UUID,
	medication VARCHAR(255),
	discount VARCHAR(255),
	plan VARCHAR(300),
	invoice_amount FLOAT,
	payment_plan_start_after INTEGER,
	payment_plan_duration INTEGER,
	payment_plan_amount FLOAT,
	payment_plan_2_duration INTEGER,
	payment_plan_2_amount FLOAT,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	invoice_amount_redrock FLOAT,
	payment_plan_amount_redrock FLOAT,
	invoice_amount_vios FLOAT,
	payment_plan_amount_vios FLOAT,
	invoice_amount_starter FLOAT,
	invoice_amount_starter_redrock FLOAT,
	invoice_amount_starter_vios FLOAT,
	invoice_amount_boothwyn FLOAT,
	invoice_amount_starter_boothwyn FLOAT,
	PRIMARY KEY (id)
);

-- Table: form_requests
CREATE TABLE IF NOT EXISTS form_requests (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	client_record_id VARCHAR(24) NOT NULL,
	form_request_id VARCHAR NOT NULL,
	form_id VARCHAR NOT NULL,
	form_request_data JSONB NOT NULL,
	discount_dict JSONB NOT NULL,
	ic_hpi TEXT,
	ic_pmh TEXT,
	ic_assessment_and_plan TEXT,
	message_to_patient TEXT,
	prescription_notes TEXT,
	task_message TEXT,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	completed_at TIMESTAMP WITHOUT TIME ZONE,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	reviewed_at TIMESTAMP WITHOUT TIME ZONE,
	send_review BOOLEAN,
	submit BOOLEAN,
	medication VARCHAR(200),
	dose VARCHAR(200),
	preferred_dose VARCHAR(200),
	current_medication VARCHAR(300),
	weight VARCHAR,
	preferred_medications VARCHAR(200),
	preferred_plan VARCHAR(200),
	discount VARCHAR(300),
	goals VARCHAR(300),
	service VARCHAR(200),
	completed BOOLEAN,
	status VARCHAR(50),
	ai_processed BOOLEAN,
	trustpilot_status VARCHAR(200),
	user_id UUID,
	package_id UUID,
	session_id UUID,
	has_sessions BOOLEAN,
	has_package BOOLEAN,
	has_pp BOOLEAN,
	has_session_note BOOLEAN,
	has_order BOOLEAN,
	has_order_note BOOLEAN,
	session_note_id VARCHAR(32),
	order_note_id VARCHAR(32),
	has_order_temp BOOLEAN,
	promo_code VARCHAR(200),
	starter_pack BOOLEAN,
	session_note_sms_send BOOLEAN,
	PRIMARY KEY (id),
	UNIQUE (form_request_id)
);

-- Table: virtual_follow_ups
CREATE TABLE IF NOT EXISTS virtual_follow_ups (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	client_record_id VARCHAR(24) NOT NULL,
	form_request_id VARCHAR,
	form_id VARCHAR,
	form_request_data JSONB,
	vf_interval_history TEXT,
	vf_weight_loss_history TEXT,
	message_to_patient TEXT,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	completed_at TIMESTAMP WITHOUT TIME ZONE,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	send_review BOOLEAN,
	submit BOOLEAN,
	medication VARCHAR(200),
	dose VARCHAR(200),
	weight VARCHAR,
	satisfaction VARCHAR,
	appetite_suppression VARCHAR(50),
	side_effects VARCHAR,
	preferred_plan VARCHAR(200),
	goals VARCHAR(300),
	service VARCHAR(200),
	completed BOOLEAN,
	order_placed BOOLEAN,
	status VARCHAR(50),
	ai_processed BOOLEAN,
	user_id UUID,
	package_id UUID,
	session_id UUID,
	plan_name VARCHAR(300),
	next_invoice_amount INTEGER,
	next_payment_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	order_date TIMESTAMP WITHOUT TIME ZONE,
	reviewed_at TIMESTAMP WITHOUT TIME ZONE,
	new_medication VARCHAR(300),
	new_dose VARCHAR(300),
	new_plan VARCHAR(500),
	new_goals VARCHAR(300),
	session_note_id VARCHAR(32),
	order_note_id VARCHAR(32),
	has_session_note BOOLEAN,
	discontinue_medication BOOLEAN,
	trustpilot_status VARCHAR(200),
	order_placed_temp BOOLEAN,
	PRIMARY KEY (id),
	UNIQUE (form_request_id) -- Note: This was also unique in form_requests, might need review
);

-- Table: pb_invoices
CREATE TABLE IF NOT EXISTS pb_invoices (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	client_record_id VARCHAR(24),
	form_request_id UUID,
	virtual_follow_up_id UUID,
	pb_invoice_id VARCHAR(24),
	status VARCHAR(24),
	ic_status BOOLEAN,
	vf_status BOOLEAN,
	pb_invoice_metadata JSONB NOT NULL,
	refunded BOOLEAN NOT NULL,
	refunded_amount INTEGER NOT NULL,
	date_created TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	date_modified TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

-- Table: pb_sessions
CREATE TABLE IF NOT EXISTS pb_sessions (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	client_record_id VARCHAR(24) NOT NULL,
	user_id UUID,
	pb_invoice_id UUID,
	virtual_follow_up_id UUID,
	form_request_id UUID,
	session_id VARCHAR NOT NULL,
	date_created TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	session_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	upcoming BOOLEAN,
	cancelled BOOLEAN,
	order_placed BOOLEAN,
	no_order_required BOOLEAN,
	other_medication_notification BOOLEAN,
	time_zone VARCHAR(50),
	duration INTEGER,
	service_type VARCHAR(50),
	confirmation_status VARCHAR(50),
	client_confirmation_status VARCHAR(50),
	session_type VARCHAR(500) NOT NULL,
	session_data JSONB,
	PRIMARY KEY (id),
	UNIQUE (virtual_follow_up_id),
	UNIQUE (form_request_id),
	UNIQUE (session_id)
);

-- Table: order
CREATE TABLE IF NOT EXISTS "order" (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	client_record_id VARCHAR(24),
	order_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	vial_size FLOAT,
	initial_dose FLOAT NOT NULL,
	units INTEGER,
	tracking_number VARCHAR(50),
	status VARCHAR(50),
	pharmacy VARCHAR(100),
	medication VARCHAR(100),
	shipping_carrier VARCHAR(100),
	order_json JSONB,
	sms_sent BOOLEAN,
	order_created_email_sent BOOLEAN,
	order_tracking_email_sent BOOLEAN,
	added_to_sheet BOOLEAN,
	parent_order_id UUID,
	ups_status VARCHAR(200),
	ups_alert BOOLEAN,
	ups_alert_date TIMESTAMP WITHOUT TIME ZONE,
	order_source VARCHAR(200),
	order_note_id VARCHAR(32),
	goals VARCHAR(60),
	reference_order_ids UUID[],
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	pharmacy_order_id VARCHAR(60),
	created_by_user_id UUID,
	sended_to_pharmacy_at TIMESTAMP WITHOUT TIME ZONE,
	send_to_pharmacy_button BOOLEAN,
	quantity INTEGER,
	plan_duration INTEGER,
	is_deleted BOOLEAN NOT NULL DEFAULT false, -- Added default
	deleted_at TIMESTAMP WITHOUT TIME ZONE,
	order_deleted_by_user_id UUID,
	sended_to_pharmacy_by_user_id UUID,
	form_request_id UUID,
	pb_session_id UUID,
	PRIMARY KEY (id),
	UNIQUE (form_request_id),
	UNIQUE (pb_session_id)
);

-- Table: sms_logs
CREATE TABLE IF NOT EXISTS sms_logs (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	client_record_id VARCHAR(24) NOT NULL,
	sms_sid VARCHAR(255) NOT NULL,
	to_number VARCHAR(50) NOT NULL,
	from_number VARCHAR(50) NOT NULL,
	message TEXT NOT NULL,
	order_id UUID,
	status VARCHAR(50) NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

-- Table: api_logs
CREATE TABLE IF NOT EXISTS api_logs (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	path VARCHAR NOT NULL,
	method VARCHAR NOT NULL,
	request_data JSONB,
	status INTEGER NOT NULL,
	log_type VARCHAR(60),
	response_data JSONB,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

-- Table: pb_client_packages
CREATE TABLE IF NOT EXISTS pb_client_packages (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	client_record_id VARCHAR(24),
	pb_client_package_id VARCHAR(24) NOT NULL,
	pb_package_id UUID,
	user_id UUID,
	name VARCHAR(255),
	payment_status VARCHAR(255),
	confirmation_status VARCHAR(255),
	"hasSessionHistory" BOOLEAN,
	is_subscription BOOLEAN,
	cancellable BOOLEAN,
	confirmed BOOLEAN,
	is_ongoing BOOLEAN,
	pb_client_meta_data JSONB NOT NULL,
	date_created TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	date_modified TIMESTAMP WITHOUT TIME ZONE,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (pb_client_package_id)
);

-- Table: discounts
CREATE TABLE IF NOT EXISTS discounts (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	name VARCHAR(255),
	code VARCHAR(255),
	description TEXT,
	amount INTEGER NOT NULL,
	percentage INTEGER NOT NULL,
	status BOOLEAN,
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (code)
);

-- Table: documents
CREATE TABLE IF NOT EXISTS documents (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	file_name VARCHAR(255) NOT NULL,
	url VARCHAR(512) NOT NULL,
	resource VARCHAR(255),
	resource_id VARCHAR(255),
	created_at TIMESTAMP WITHOUT TIME ZONE,
	updated_at TIMESTAMP WITHOUT TIME ZONE,
	PRIMARY KEY (id)
);

-- Table: blacklists
CREATE TABLE IF NOT EXISTS blacklists (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	value VARCHAR(255),
	category VARCHAR(50) NOT NULL,
	address JSONB,
	description TEXT,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (value)
);

-- Table: pb_tasks
CREATE TABLE IF NOT EXISTS pb_tasks (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	pb_task_id VARCHAR(24),
	user_id UUID,
	client_record_id VARCHAR(24) NOT NULL,
	due_date TIMESTAMP WITHOUT TIME ZONE,
	duration INTEGER,
	completed BOOLEAN,
	past_due BOOLEAN,
	all_day BOOLEAN,
	reminder_type VARCHAR(24),
	priority VARCHAR(24),
	title TEXT,
	notes TEXT,
	message TEXT,
	task_meta_data JSONB NOT NULL,
	archived BOOLEAN,
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
	date_created TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	date_modified TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	PRIMARY KEY (id)
);

-- Table: email_logs
CREATE TABLE IF NOT EXISTS email_logs (
	id UUID NOT NULL DEFAULT uuid_generate_v4(), -- Assuming UUID generation
	order_id UUID,
	client_record_id VARCHAR(24) NOT NULL,
	message_id VARCHAR(255),
	template_id VARCHAR(255),
	body TEXT NOT NULL,
	name VARCHAR(150),
	status VARCHAR(50) NOT NULL,
	meta_data JSONB NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE,
	updated_at TIMESTAMP WITHOUT TIME ZONE,
	PRIMARY KEY (id)
);


-- Add Foreign Key Constraints using ALTER TABLE

ALTER TABLE crisp_session
ADD CONSTRAINT fk_crisp_session_client_record
FOREIGN KEY (client_record_id) REFERENCES client_record (id);

ALTER TABLE session
ADD CONSTRAINT fk_session_client_record
FOREIGN KEY (client_record_id) REFERENCES client_record (id);

ALTER TABLE questionnaire_question
ADD CONSTRAINT fk_question_questionnaire
FOREIGN KEY (questionnaire_id) REFERENCES questionnaire (id);

ALTER TABLE session_chat_history
ADD CONSTRAINT fk_chat_history_session
FOREIGN KEY (session_id) REFERENCES session (id);

ALTER TABLE session_chat_history
ADD CONSTRAINT fk_chat_history_question
FOREIGN KEY (questionnaire_question_id) REFERENCES questionnaire_question (id);

ALTER TABLE "order"
ADD CONSTRAINT fk_order_client_record
FOREIGN KEY (client_record_id) REFERENCES client_record (id);

ALTER TABLE "order"
ADD CONSTRAINT fk_order_parent_order
FOREIGN KEY (parent_order_id) REFERENCES "order" (id);

ALTER TABLE "order"
ADD CONSTRAINT fk_order_created_by_user
FOREIGN KEY (created_by_user_id) REFERENCES "user" (id);

ALTER TABLE "order"
ADD CONSTRAINT fk_order_deleted_by_user
FOREIGN KEY (order_deleted_by_user_id) REFERENCES "user" (id);

ALTER TABLE "order"
ADD CONSTRAINT fk_order_sended_by_user
FOREIGN KEY (sended_to_pharmacy_by_user_id) REFERENCES "user" (id);

ALTER TABLE "order"
ADD CONSTRAINT fk_order_form_request
FOREIGN KEY (form_request_id) REFERENCES form_requests (id);

ALTER TABLE "order"
ADD CONSTRAINT fk_order_pb_session
FOREIGN KEY (pb_session_id) REFERENCES pb_sessions (id);

ALTER TABLE intent
ADD CONSTRAINT fk_intent_category
FOREIGN KEY (category_id) REFERENCES category (id);

ALTER TABLE knowledge_base
ADD CONSTRAINT fk_kb_category
FOREIGN KEY (category_id) REFERENCES category (id);

ALTER TABLE knowledge_base_approval
ADD CONSTRAINT fk_kb_approval_category
FOREIGN KEY (category_id) REFERENCES category (id);

ALTER TABLE langchain_pg_embedding
ADD CONSTRAINT fk_embedding_collection
FOREIGN KEY (collection_id) REFERENCES langchain_pg_collection (uuid);

ALTER TABLE check_in
ADD CONSTRAINT fk_check_in_client_record
FOREIGN KEY (client_record_id) REFERENCES client_record (id);

ALTER TABLE test_session
ADD CONSTRAINT fk_test_session_user
FOREIGN KEY (user_id) REFERENCES "user" (id);

ALTER TABLE test_session
ADD CONSTRAINT fk_test_session_client_record
FOREIGN KEY (client_record_id) REFERENCES client_record (id);

ALTER TABLE sms_logs
ADD CONSTRAINT fk_sms_logs_client_record
FOREIGN KEY (client_record_id) REFERENCES client_record (id);

ALTER TABLE sms_logs
ADD CONSTRAINT fk_sms_logs_order
FOREIGN KEY (order_id) REFERENCES "order" (id);

ALTER TABLE pb_sessions
ADD CONSTRAINT fk_pb_sessions_client_record
FOREIGN KEY (client_record_id) REFERENCES client_record (id);

ALTER TABLE pb_sessions
ADD CONSTRAINT fk_pb_sessions_user
FOREIGN KEY (user_id) REFERENCES "user" (id);

ALTER TABLE pb_sessions
ADD CONSTRAINT fk_pb_sessions_invoice
FOREIGN KEY (pb_invoice_id) REFERENCES pb_invoices (id);

ALTER TABLE pb_sessions
ADD CONSTRAINT fk_pb_sessions_vf
FOREIGN KEY (virtual_follow_up_id) REFERENCES virtual_follow_ups (id);

ALTER TABLE pb_sessions
ADD CONSTRAINT fk_pb_sessions_form_request
FOREIGN KEY (form_request_id) REFERENCES form_requests (id);

ALTER TABLE pb_packages
ADD CONSTRAINT fk_pb_packages_user
FOREIGN KEY (user_id) REFERENCES "user" (id);

ALTER TABLE packages
ADD CONSTRAINT fk_packages_pb_package
FOREIGN KEY (pb_package_id) REFERENCES pb_packages (id);

ALTER TABLE form_requests
ADD CONSTRAINT fk_form_requests_client_record
FOREIGN KEY (client_record_id) REFERENCES client_record (id);

ALTER TABLE form_requests
ADD CONSTRAINT fk_form_requests_user
FOREIGN KEY (user_id) REFERENCES "user" (id);

ALTER TABLE form_requests
ADD CONSTRAINT fk_form_requests_package
FOREIGN KEY (package_id) REFERENCES packages (id);

ALTER TABLE email_logs
ADD CONSTRAINT fk_email_logs_order
FOREIGN KEY (order_id) REFERENCES "order" (id);

ALTER TABLE email_logs
ADD CONSTRAINT fk_email_logs_client_record
FOREIGN KEY (client_record_id) REFERENCES client_record (id);

ALTER TABLE pb_invoices
ADD CONSTRAINT fk_pb_invoices_client_record
FOREIGN KEY (client_record_id) REFERENCES client_record (id);

ALTER TABLE pb_invoices
ADD CONSTRAINT fk_pb_invoices_form_request
FOREIGN KEY (form_request_id) REFERENCES form_requests (id);

ALTER TABLE pb_invoices
ADD CONSTRAINT fk_pb_invoices_vf
FOREIGN KEY (virtual_follow_up_id) REFERENCES virtual_follow_ups (id);

ALTER TABLE pb_tasks
ADD CONSTRAINT fk_pb_tasks_user
FOREIGN KEY (user_id) REFERENCES "user" (id);

ALTER TABLE pb_tasks
ADD CONSTRAINT fk_pb_tasks_client_record
FOREIGN KEY (client_record_id) REFERENCES client_record (id);

ALTER TABLE virtual_follow_ups
ADD CONSTRAINT fk_vf_client_record
FOREIGN KEY (client_record_id) REFERENCES client_record (id);

ALTER TABLE virtual_follow_ups
ADD CONSTRAINT fk_vf_user
FOREIGN KEY (user_id) REFERENCES "user" (id);

ALTER TABLE virtual_follow_ups
ADD CONSTRAINT fk_vf_package
FOREIGN KEY (package_id) REFERENCES packages (id);

ALTER TABLE pb_client_packages
ADD CONSTRAINT fk_pb_client_packages_client_record
FOREIGN KEY (client_record_id) REFERENCES client_record (id);

ALTER TABLE pb_client_packages
ADD CONSTRAINT fk_pb_client_packages_pb_package
FOREIGN KEY (pb_package_id) REFERENCES pb_packages (id);

ALTER TABLE pb_client_packages
ADD CONSTRAINT fk_pb_client_packages_user
FOREIGN KEY (user_id) REFERENCES "user" (id);
