-- Educational resources tables for patient education content

-- Educational resources table
CREATE TABLE IF NOT EXISTS educational_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id VARCHAR(100) NOT NULL UNIQUE, -- e.g., "ED-FIN-001"
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL, -- Rich text content
    content_type VARCHAR(50) NOT NULL, -- "medication_guide", "usage_guide", "condition_info", "side_effect"
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- "draft", "review", "active", "archived"
    version FLOAT NOT NULL DEFAULT 1.0,
    keywords TEXT[], -- Array of keywords for search
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    reading_time_minutes INTEGER,
    category VARCHAR(100) REFERENCES categories(category_id), -- Link to existing categories
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_educational_resources_content_id ON educational_resources(content_id);
CREATE INDEX IF NOT EXISTS idx_educational_resources_content_type ON educational_resources(content_type);
CREATE INDEX IF NOT EXISTS idx_educational_resources_status ON educational_resources(status);
CREATE INDEX IF NOT EXISTS idx_educational_resources_category ON educational_resources(category);

-- Product-Resource associations
CREATE TABLE IF NOT EXISTS product_resources (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES educational_resources(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE, -- Indicates if this is the primary resource for the product
    display_order INTEGER DEFAULT 0,
    PRIMARY KEY (product_id, resource_id)
);

-- Condition-Resource associations
CREATE TABLE IF NOT EXISTS condition_resources (
    condition_id VARCHAR(100) NOT NULL, -- e.g., "male-pattern-baldness"
    resource_id UUID REFERENCES educational_resources(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE, -- Indicates if this is the primary resource for the condition
    display_order INTEGER DEFAULT 0,
    PRIMARY KEY (condition_id, resource_id)
);

-- Resource related resources (for "see also" functionality)
CREATE TABLE IF NOT EXISTS related_resources (
    resource_id UUID REFERENCES educational_resources(id) ON DELETE CASCADE,
    related_resource_id UUID REFERENCES educational_resources(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'related', -- "related", "prerequisite", "follow-up"
    display_order INTEGER DEFAULT 0,
    PRIMARY KEY (resource_id, related_resource_id)
);

-- Insert sample educational resources
INSERT INTO educational_resources (
    content_id, 
    title, 
    description, 
    content, 
    content_type, 
    status, 
    version, 
    keywords, 
    featured, 
    reading_time_minutes, 
    category
) VALUES
    (
        'ED-FIN-001',
        'Finasteride Patient Information',
        'Essential information for patients taking Finasteride for hair loss treatment',
        '<h3>Finasteride Patient Information</h3> <p><strong>What is Finasteride?</strong></p> <p>Finasteride is a prescription medication used to treat male pattern hair loss (androgenetic alopecia). It works by blocking the conversion of testosterone to dihydrotestosterone (DHT), a hormone that contributes to hair loss in genetically susceptible men.</p> <p><strong>Important Information</strong></p> <ul><li>Finasteride is for use by MEN ONLY and should NOT be used by women or children.</li><li>Women who are or may become pregnant should not handle crushed or broken finasteride tablets, as the active ingredient may harm a male fetus.</li><li>It may take 3-6 months of daily use before you notice an improvement in your hair loss.</li><li>If you stop taking finasteride, you will likely lose any hair you gained during treatment.</li></ul> <p><strong>How to Take Finasteride</strong></p> <ul><li>Take one tablet (1mg) by mouth once daily, with or without food.</li><li>Take this medication regularly to get the most benefit.</li><li>Do not increase your dose or take it more often than prescribed.</li></ul> <p><strong>Potential Side Effects</strong></p> <p>Common side effects may include:</p> <ul><li>Decreased sex drive</li><li>Erectile dysfunction</li><li>Decreased amount of semen released during sex</li></ul> <p>Serious side effects (rare) may include:</p> <ul><li>Lumps or pain in your breasts</li><li>Nipple discharge</li><li>Depression or mood changes</li><li>Allergic reactions such as rash, itching, or swelling</li></ul> <p>If you experience any serious side effects, contact your healthcare provider immediately.</p>',
        'medication_guide',
        'active',
        2.3,
        ARRAY['finasteride', 'hair loss', 'medication', 'DHT', 'side effects'],
        TRUE,
        5,
        'hair'
    ),
    (
        'ED-MIN-001',
        'Minoxidil Usage Instructions',
        'How to properly apply and use Minoxidil for hair loss treatment',
        '<h3>Minoxidil Usage Instructions</h3> <p><strong>What is Minoxidil?</strong></p> <p>Minoxidil is an over-the-counter medication used to treat hair loss. It works by prolonging the growth phase of hair follicles and increasing the size of hair follicles to promote hair growth.</p> <p><strong>How to Apply Minoxidil Solution</strong></p> <ol><li>Make sure your scalp and hair are completely dry before application.</li><li>Fill the dropper to the 1ml mark (or as prescribed).</li><li>Apply the solution directly to the areas of the scalp experiencing hair thinning.</li><li>Gently massage the solution into your scalp with your fingertips.</li><li>Wash your hands thoroughly after application.</li><li>Allow the solution to dry completely before using other hair products or going to bed.</li></ol> <p><strong>Important Information</strong></p> <ul><li>Apply twice daily, once in the morning and once at night, or as directed by your healthcare provider.</li><li>It may take up to 4 months of regular use before you notice results.</li><li>If you stop using minoxidil, any new hair growth will likely be lost.</li><li>Do not apply to irritated, sunburned, or broken skin.</li></ul> <p><strong>Potential Side Effects</strong></p> <p>Common side effects may include:</p> <ul><li>Scalp irritation, itching, or dryness</li><li>Flaking or scaling</li><li>Temporary shedding during the first few weeks of treatment</li></ul> <p>Less common side effects may include:</p> <ul><li>Unwanted hair growth on the face or other areas</li><li>Dizziness or lightheadedness</li><li>Rapid heartbeat</li><li>Swelling of the face, hands, or feet</li></ul> <p>If you experience any serious side effects, discontinue use and contact your healthcare provider immediately.</p>',
        'usage_guide',
        'active',
        1.5,
        ARRAY['minoxidil', 'hair loss', 'topical', 'application', 'usage'],
        FALSE,
        4,
        'hair'
    ),
    (
        'CI-MPB-001',
        'Understanding Male Pattern Baldness',
        'Comprehensive information about the causes, progression, and treatment options for male pattern baldness',
        '<h3>Understanding Male Pattern Baldness</h3> <p><strong>What is Male Pattern Baldness?</strong></p> <p>Male pattern baldness (androgenetic alopecia) is the most common type of hair loss in men. It is characterized by a receding hairline and thinning of the hair on the crown and temples, eventually leading to partial or complete baldness.</p> <p><strong>Causes</strong></p> <p>Male pattern baldness is primarily caused by:</p> <ul><li><strong>Genetics:</strong> It is inherited from either or both parents.</li><li><strong>Hormones:</strong> Dihydrotestosterone (DHT), a derivative of testosterone, is the main hormone responsible for male pattern baldness. DHT causes hair follicles to shrink, resulting in shorter and thinner hair until the follicles eventually stop producing hair.</li><li><strong>Age:</strong> The likelihood of experiencing male pattern baldness increases with age.</li></ul> <p><strong>Progression</strong></p> <p>Male pattern baldness typically follows a predictable pattern:</p> <ol><li>Receding hairline at the temples</li><li>Thinning crown</li><li>Gradual expansion of bald areas</li><li>Eventual joining of the receding hairline and thinning crown</li></ol> <p>The Norwood Scale is commonly used to classify the stages of male pattern baldness, ranging from Stage 1 (minimal hair loss) to Stage 7 (extensive baldness with only a band of hair remaining on the sides and back of the head).</p> <p><strong>Treatment Options</strong></p> <p>Several treatment options are available for male pattern baldness:</p> <ul><li><strong>Medications:</strong> Finasteride and minoxidil are FDA-approved treatments that can slow hair loss and promote regrowth in some men.</li><li><strong>Hair Transplantation:</strong> Surgical procedures that move hair follicles from areas with thick growth to balding areas.</li><li><strong>Laser Therapy:</strong> Low-level laser therapy may stimulate hair growth in some individuals.</li><li><strong>Lifestyle Changes:</strong> Maintaining a healthy diet, reducing stress, and avoiding harsh hair treatments may help slow hair loss.</li></ul> <p><strong>When to Seek Medical Advice</strong></p> <p>Consider consulting a healthcare provider if:</p> <ul><li>Your hair loss is sudden or patchy</li><li>You experience significant shedding</li><li>You notice scalp abnormalities such as redness, pain, or scaling</li><li>You are concerned about the psychological impact of hair loss</li></ul> <p>Early intervention often leads to better outcomes in managing male pattern baldness.</p>',
        'condition_info',
        'active',
        3.2,
        ARRAY['male pattern baldness', 'androgenetic alopecia', 'hair loss', 'DHT', 'baldness'],
        TRUE,
        8,
        'hair'
    ),
    (
        'SE-FIN-001',
        'Managing Finasteride Side Effects',
        'Information on potential side effects of Finasteride and how to manage them',
        '<h3>Managing Finasteride Side Effects</h3> <p><strong>Understanding Finasteride Side Effects</strong></p> <p>While Finasteride is effective for treating male pattern baldness, some users may experience side effects. Most side effects are mild and often resolve on their own, but it\'s important to be informed about potential issues and know when to seek medical attention.</p> <p><strong>Sexual Side Effects</strong></p> <p>The most commonly reported side effects of Finasteride are related to sexual function:</p> <ul><li><strong>Decreased libido (sex drive)</strong></li><li><strong>Erectile dysfunction</strong></li><li><strong>Decreased ejaculate volume</strong></li></ul> <p>Management strategies:</p> <ul><li>Discuss with your healthcare provider about adjusting your dosage</li><li>Consider a temporary break from the medication (only under medical supervision)</li><li>Remember that many sexual side effects resolve while continuing treatment</li></ul> <p><strong>Psychological Effects</strong></p> <p>Some users report psychological effects such as:</p> <ul><li>Depression</li><li>Anxiety</li><li>Mood changes</li></ul> <p>Management strategies:</p> <ul><li>Monitor your mood regularly</li><li>Maintain open communication with your healthcare provider</li><li>Consider counseling if psychological symptoms persist</li></ul> <p><strong>Physical Side Effects</strong></p> <p>Less common physical side effects may include:</p> <ul><li>Breast tenderness or enlargement</li><li>Skin rash</li><li>Testicular pain</li></ul> <p>Management strategies:</p> <ul><li>Report any unusual physical symptoms to your healthcare provider promptly</li><li>Do not discontinue medication without medical consultation</li></ul> <p><strong>When to Seek Medical Attention</strong></p> <p>Contact your healthcare provider immediately if you experience:</p> <ul><li>Severe depression or suicidal thoughts</li><li>Persistent erectile dysfunction that doesn\'t improve</li><li>Lumps, pain, or discharge from breasts</li><li>Severe allergic reactions (rash, itching, swelling, dizziness, trouble breathing)</li></ul> <p><strong>Long-term Considerations</strong></p> <p>For most men, side effects of Finasteride are minimal and may decrease over time. Regular follow-up appointments with your healthcare provider are important to monitor for any adverse effects and ensure the medication continues to be appropriate for you.</p> <p>Remember that the benefits of Finasteride in treating hair loss should be weighed against the potential risks of side effects. Always discuss any concerns with your healthcare provider.</p>',
        'side_effect',
        'active',
        2.5,
        ARRAY['finasteride', 'side effects', 'sexual side effects', 'management', 'hair loss treatment'],
        FALSE,
        6,
        'hair'
    ),
    (
        'ED-SIL-001',
        'Sildenafil Information Sheet',
        'Essential information for patients taking Sildenafil for erectile dysfunction',
        '<h3>Sildenafil Information Sheet</h3> <p><strong>What is Sildenafil?</strong></p> <p>Sildenafil (commonly known by the brand name Viagra) is a medication used to treat erectile dysfunction (ED). It works by increasing blood flow to the penis during sexual stimulation, helping to achieve and maintain an erection.</p> <p><strong>Important Information</strong></p> <ul><li>Sildenafil does not work without sexual stimulation.</li><li>It should be taken approximately 30-60 minutes before sexual activity.</li><li>The effects typically last for 4-5 hours.</li><li>Do not take more than one dose per day.</li></ul> <p><strong>How to Take Sildenafil</strong></p> <ul><li>Take as directed by your healthcare provider, usually 50mg to start.</li><li>Take with or without food, but a high-fat meal may delay its effects.</li><li>Avoid grapefruit or grapefruit juice, as they may increase the medication\'s effects.</li><li>Do not use with nitrates (such as nitroglycerin) or recreational drugs called "poppers" as this combination can cause a dangerous drop in blood pressure.</li></ul> <p><strong>Potential Side Effects</strong></p> <p>Common side effects may include:</p> <ul><li>Headache</li><li>Flushing (warmth, redness, or tingly feeling)</li><li>Upset stomach or indigestion</li><li>Abnormal vision (blurred vision, changes in color vision)</li><li>Stuffy or runny nose</li><li>Back pain or muscle aches</li><li>Dizziness</li></ul> <p>Serious side effects (rare) may include:</p> <ul><li>Vision changes or sudden vision loss</li><li>Ringing in ears or sudden hearing loss</li><li>Chest pain, irregular heartbeat, or severe dizziness</li><li>Shortness of breath</li><li>Priapism (painful erection lasting longer than 4 hours)</li></ul> <p>If you experience any serious side effects, seek medical attention immediately.</p> <p><strong>Precautions</strong></p> <p>Before taking sildenafil, tell your healthcare provider if you:</p> <ul><li>Have heart problems or have had a heart attack or stroke</li><li>Have low or high blood pressure</li><li>Have liver or kidney problems</li><li>Have a blood cell disorder</li><li>Have a physical deformity of the penis</li><li>Have had an erection lasting more than 4 hours</li><li>Take any other medications, especially nitrates</li></ul> <p>Always follow your healthcare provider\'s instructions and report any unusual symptoms promptly.</p>',
        'medication_guide',
        'active',
        2.1,
        ARRAY['sildenafil', 'viagra', 'erectile dysfunction', 'ED', 'medication'],
        TRUE,
        5,
        'ed'
    );

-- Insert sample product-resource associations
INSERT INTO product_resources (product_id, resource_id, is_primary, display_order)
SELECT 
    p.id, 
    er.id, 
    TRUE, 
    0
FROM 
    products p, 
    educational_resources er
WHERE 
    p.name = 'Finasteride 1mg' AND er.content_id = 'ED-FIN-001'
ON CONFLICT DO NOTHING;

INSERT INTO product_resources (product_id, resource_id, is_primary, display_order)
SELECT 
    p.id, 
    er.id, 
    FALSE, 
    1
FROM 
    products p, 
    educational_resources er
WHERE 
    p.name = 'Finasteride 1mg' AND er.content_id = 'SE-FIN-001'
ON CONFLICT DO NOTHING;

INSERT INTO product_resources (product_id, resource_id, is_primary, display_order)
SELECT 
    p.id, 
    er.id, 
    TRUE, 
    0
FROM 
    products p, 
    educational_resources er
WHERE 
    p.name = 'Minoxidil 5% Solution' AND er.content_id = 'ED-MIN-001'
ON CONFLICT DO NOTHING;

INSERT INTO product_resources (product_id, resource_id, is_primary, display_order)
SELECT 
    p.id, 
    er.id, 
    TRUE, 
    0
FROM 
    products p, 
    educational_resources er
WHERE 
    p.name = 'Sildenafil' AND er.content_id = 'ED-SIL-001'
ON CONFLICT DO NOTHING;

-- Insert sample condition-resource associations
INSERT INTO condition_resources (condition_id, resource_id, is_primary, display_order)
VALUES
    ('male-pattern-baldness', (SELECT id FROM educational_resources WHERE content_id = 'CI-MPB-001'), TRUE, 0),
    ('male-pattern-baldness', (SELECT id FROM educational_resources WHERE content_id = 'ED-FIN-001'), FALSE, 1),
    ('male-pattern-baldness', (SELECT id FROM educational_resources WHERE content_id = 'ED-MIN-001'), FALSE, 2),
    ('erectile-dysfunction', (SELECT id FROM educational_resources WHERE content_id = 'ED-SIL-001'), TRUE, 0);

-- Insert sample related resources
INSERT INTO related_resources (resource_id, related_resource_id, relationship_type, display_order)
SELECT 
    er1.id, 
    er2.id, 
    'related', 
    0
FROM 
    educational_resources er1, 
    educational_resources er2
WHERE 
    er1.content_id = 'ED-FIN-001' AND er2.content_id = 'SE-FIN-001'
ON CONFLICT DO NOTHING;

INSERT INTO related_resources (resource_id, related_resource_id, relationship_type, display_order)
SELECT 
    er1.id, 
    er2.id, 
    'related', 
    0
FROM 
    educational_resources er1, 
    educational_resources er2
WHERE 
    er1.content_id = 'ED-FIN-001' AND er2.content_id = 'CI-MPB-001'
ON CONFLICT DO NOTHING;

INSERT INTO related_resources (resource_id, related_resource_id, relationship_type, display_order)
SELECT 
    er1.id, 
    er2.id, 
    'related', 
    0
FROM 
    educational_resources er1, 
    educational_resources er2
WHERE 
    er1.content_id = 'ED-MIN-001' AND er2.content_id = 'CI-MPB-001'
ON CONFLICT DO NOTHING;
