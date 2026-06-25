DELETE FROM triage_rule_symptoms;
DELETE FROM triage_rules;
DELETE FROM evaluation_templates;
DELETE FROM diseases_typical_symptoms;
DELETE FROM symptoms;
DELETE FROM diseases;

INSERT INTO diseases (id, name, category, is_auto_treatable, default_complexity) VALUES
-- Pneumologie & ORL
('11111111-1111-1111-1111-000000000001', 'Gripa sezoniera',                'Pneumologie',    TRUE,  2),
('11111111-1111-1111-1111-000000000002', 'Pneumonie acuta',                'Pneumologie',    FALSE, 4),
('11111111-1111-1111-1111-000000000003', 'Astm bronsic (Exacerbare)',      'Pneumologie',    FALSE, 4),
('11111111-1111-1111-1111-000000000004', 'Bronsita acuta',                 'Pneumologie',    TRUE,  2),
('11111111-1111-1111-1111-000000000005', 'COVID-19',                       'Pneumologie',    FALSE, 3),
('11111111-1111-1111-1111-000000000006', 'Otita medie acuta',              'ORL',            TRUE,  2),
('11111111-1111-1111-1111-000000000007', 'Amigdalita bacteriana',          'ORL',            FALSE, 3),
('11111111-1111-1111-1111-000000000008', 'Sinuzita acuta',                 'ORL',            TRUE,  2),
('11111111-1111-1111-1111-000000000009', 'Laringita acuta',                'ORL',            TRUE,  1),
('11111111-1111-1111-1111-000000000010', 'Rinofaringita (Raceala comuna)', 'ORL',            TRUE,  1),

-- Cardiologie
('11111111-1111-1111-1111-000000000011', 'Infarct Miocardic Acut',         'Cardiologie',    FALSE, 5),
('11111111-1111-1111-1111-000000000012', 'Hipertensiune Arteriala (Criza)','Cardiologie',    FALSE, 4),
('11111111-1111-1111-1111-000000000013', 'Angina pectorala',               'Cardiologie',    FALSE, 4),

-- Gastroenterologie
('11111111-1111-1111-1111-000000000014', 'Gastroenterita virala',          'Gastro',         TRUE,  2),
('11111111-1111-1111-1111-000000000015', 'Apendicita acuta (Peritonita)',  'Gastro',         FALSE, 5),
('11111111-1111-1111-1111-000000000016', 'Ulcer gastric (Criza)',          'Gastro',         FALSE, 3),
('11111111-1111-1111-1111-000000000017', 'Colecistita acuta (Criza fiere)','Gastro',         FALSE, 4),
('11111111-1111-1111-1111-000000000018', 'Sindrom Intestin Iritabil',      'Gastro',         TRUE,  2),

-- Neurologie & Psihiatrie
('11111111-1111-1111-1111-000000000019', 'Atac vascular cerebral (AVC)',   'Neurologie',     FALSE, 5),
('11111111-1111-1111-1111-000000000020', 'Migrena severa',                 'Neurologie',     TRUE,  2),
('11111111-1111-1111-1111-000000000021', 'Vertij paroxistic',              'Neurologie',     TRUE,  2),
('11111111-1111-1111-1111-000000000022', 'Epilepsie (Criza)',              'Neurologie',     FALSE, 5),
('11111111-1111-1111-1111-000000000023', 'Atac de panica / Anxietate',     'Psihiatrie',     TRUE,  2),
('11111111-1111-1111-1111-000000000024', 'Episod depresiv major',          'Psihiatrie',     FALSE, 3),

-- Urologie & Ginecologie
('11111111-1111-1111-1111-000000000025', 'Cistita acuta',                  'Urologie',       TRUE,  2),
('11111111-1111-1111-1111-000000000026', 'Colica renala',                  'Urologie',       FALSE, 4),
('11111111-1111-1111-1111-000000000027', 'Pielonefrita',                   'Urologie',       FALSE, 4),
('11111111-1111-1111-1111-000000000028', 'Dismenoree severa',              'Ginecologie',    TRUE,  2),
('11111111-1111-1111-1111-000000000029', 'Sarcina extrauterina',           'Ginecologie',    FALSE, 5),

-- Oftalmologie, Alergologie, Dermatologie
('11111111-1111-1111-1111-000000000030', 'Conjunctivita acuta',            'Oftalmologie',   TRUE,  1),
('11111111-1111-1111-1111-000000000031', 'Glaucom acut',                   'Oftalmologie',   FALSE, 5),
('11111111-1111-1111-1111-000000000032', 'Reactie anafilactica',           'Alergologie',    FALSE, 5),
('11111111-1111-1111-1111-000000000033', 'Dermatita de contact / Urticarie','Dermatologie',  TRUE,  2),

-- Pediatrie, Ortopedie, Medicina Generala
('11111111-1111-1111-1111-000000000034', 'Varicela',                       'Pediatrie',      TRUE,  2),
('11111111-1111-1111-1111-000000000035', 'Rujeola',                        'Pediatrie',      FALSE, 3),
('11111111-1111-1111-1111-000000000036', 'Entorsa / Luxatie',              'Ortopedie',      FALSE, 3),
('11111111-1111-1111-1111-000000000037', 'Lombalgie acuta',                'Ortopedie',      TRUE,  2);


INSERT INTO symptoms (id, name, body_system, is_critical) VALUES
('22222222-2222-2222-2222-000000000001', 'Febra (> 38C)',                             'General',       2),
('22222222-2222-2222-2222-000000000002', 'Tuse seaca',                                'Respirator',    1),
('22222222-2222-2222-2222-000000000003', 'Tuse productiva',                           'Respirator',    2),
('22222222-2222-2222-2222-000000000004', 'Dificultati de respiratie (Dispnee)',       'Respirator',    3),
('22222222-2222-2222-2222-000000000005', 'Respiratie suieratoare (Wheezing)',         'Respirator',    3),
('22222222-2222-2222-2222-000000000006', 'Durere in gat la inghitire',                'ORL',           1),
('22222222-2222-2222-2222-000000000007', 'Nas infundat / Secretii nazale',            'ORL',           1),
('22222222-2222-2222-2222-000000000008', 'Durere de ureche',                          'ORL',           2),
('22222222-2222-2222-2222-000000000009', 'Durere de cap severa (Cefalee)',            'Neurologic',    2),
('22222222-2222-2222-2222-000000000010', 'Ameteala / Vertij',                         'Neurologic',    2),
('22222222-2222-2222-2222-000000000011', 'Slabiciune pe o parte a corpului (Pareza)', 'Neurologic',    3),
('22222222-2222-2222-2222-000000000012', 'Pierderea starii de constienta (Lesin)',    'Cardiovascular',3),
('22222222-2222-2222-2222-000000000013', 'Durere toracica (In piept)',                'Cardiovascular',3),
('22222222-2222-2222-2222-000000000014', 'Palpitatii (Batai rapide)',                 'Cardiovascular',2),
('22222222-2222-2222-2222-000000000015', 'Dureri abdominale acute',                   'Digestiv',      3),
('22222222-2222-2222-2222-000000000016', 'Dureri abdominale difuze / Crampe',         'Digestiv',      2),
('22222222-2222-2222-2222-000000000017', 'Greata si Varsaturi',                       'Digestiv',      2),
('22222222-2222-2222-2222-000000000018', 'Diaree',                                    'Digestiv',      2),
('22222222-2222-2222-2222-000000000019', 'Arsuri in capul pieptului (Pirozis)',       'Digestiv',      1),
('22222222-2222-2222-2222-000000000020', 'Durere lombara (Spate/Rinichi)',            'Ortopedic/Uro', 2),
('22222222-2222-2222-2222-000000000021', 'Arsuri la urinare (Disurie)',               'Urologic',      2),
('22222222-2222-2222-2222-000000000022', 'Urinari frecvente (Polakiurie)',            'Urologic',      1),
('22222222-2222-2222-2222-000000000023', 'Sange in urina (Hematurie)',                'Urologic',      3),
('22222222-2222-2222-2222-000000000024', 'Durere pelvina (Jos in abdomen)',           'Ginecologic',   2),
('22222222-2222-2222-2222-000000000025', 'Sangerare anormala',                        'Ginecologic',   3),
('22222222-2222-2222-2222-000000000026', 'Ochi rosu si secretii',                     'Oftalmologic',  1),
('22222222-2222-2222-2222-000000000027', 'Durere oculara severa',                     'Oftalmologic',  3),
('22222222-2222-2222-2222-000000000028', 'Tulburari de vedere bruste',                'Oftalmologic',  3),
('22222222-2222-2222-2222-000000000029', 'Eruptie cutanata / Blande',                 'Dermatologic',  2),
('22222222-2222-2222-2222-000000000030', 'Mancarime intensa (Prurit)',                'Dermatologic',  1),
('22222222-2222-2222-2222-000000000031', 'Umflarea fetei / Buzelor (Angioedem)',      'Alergologic',   3),
('22222222-2222-2222-2222-000000000032', 'Anxietate extrema / Frica de moarte',       'Psihiatric',    2),
('22222222-2222-2222-2222-000000000033', 'Tristete profunda / Apatie',                'Psihiatric',    2),
('22222222-2222-2222-2222-000000000034', 'Dureri articulare / Musculare',             'Ortopedic',     1),
('22222222-2222-2222-2222-000000000035', 'Oboseala extrema / Astenie',                'General',       2);


-- Gripa (11..1): Febra, Tuse seaca, Dureri musculare, Oboseala
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000001', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000002', 4);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000034', 4);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000001', '22222222-2222-2222-2222-000000000035', 5);

-- Pneumonie (11..2): Febra, Tuse productiva, Dispnee
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000002', '22222222-2222-2222-2222-000000000001', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000002', '22222222-2222-2222-2222-000000000003', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000002', '22222222-2222-2222-2222-000000000004', 5);

-- Astm (11..3): Dispnee, Wheezing, Tuse seaca
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000003', '22222222-2222-2222-2222-000000000004', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000003', '22222222-2222-2222-2222-000000000005', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000003', '22222222-2222-2222-2222-000000000002', 3);

-- COVID-19 (11..5): Febra, Tuse seaca, Oboseala, Dispnee
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000005', '22222222-2222-2222-2222-000000000001', 4);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000005', '22222222-2222-2222-2222-000000000002', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000005', '22222222-2222-2222-2222-000000000035', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000005', '22222222-2222-2222-2222-000000000004', 4);

-- Raceala comuna (11..10): Nas infundat, Durere in gat, Tuse seaca
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000010', '22222222-2222-2222-2222-000000000007', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000010', '22222222-2222-2222-2222-000000000006', 4);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000010', '22222222-2222-2222-2222-000000000002', 3);

-- Infarct (11..11): Durere toracica, Dispnee, Palpitatii, Frica
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000011', '22222222-2222-2222-2222-000000000013', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000011', '22222222-2222-2222-2222-000000000004', 4);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000011', '22222222-2222-2222-2222-000000000014', 3);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000011', '22222222-2222-2222-2222-000000000032', 4);

-- Atac de panica (11..23): Anxietate, Palpitatii, Dispnee, Durere toracica
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000023', '22222222-2222-2222-2222-000000000032', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000023', '22222222-2222-2222-2222-000000000014', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000023', '22222222-2222-2222-2222-000000000004', 4);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000023', '22222222-2222-2222-2222-000000000013', 3);

-- Apendicita acuta (11..15): Durere abd. acuta, Greata/Varsaturi, Febra
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000015', '22222222-2222-2222-2222-000000000015', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000015', '22222222-2222-2222-2222-000000000017', 4);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000015', '22222222-2222-2222-2222-000000000001', 3);

-- Gastroenterita virala (11..14): Diaree, Varsaturi, Crampe
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000014', '22222222-2222-2222-2222-000000000018', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000014', '22222222-2222-2222-2222-000000000017', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000014', '22222222-2222-2222-2222-000000000016', 4);

-- Colica renala (11..26): Durere lombara, Varsaturi, Disurie, Hematurie
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000026', '22222222-2222-2222-2222-000000000020', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000026', '22222222-2222-2222-2222-000000000017', 4);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000026', '22222222-2222-2222-2222-000000000021', 3);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000026', '22222222-2222-2222-2222-000000000023', 5);

-- Cistita acuta (11..25): Disurie, Polakiurie, Durere pelvina
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000025', '22222222-2222-2222-2222-000000000021', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000025', '22222222-2222-2222-2222-000000000022', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000025', '22222222-2222-2222-2222-000000000024', 3);

-- Sarcina extrauterina (11..29): Durere pelvina, Sangerare, Lesin, Dureri abdominale
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000029', '22222222-2222-2222-2222-000000000024', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000029', '22222222-2222-2222-2222-000000000025', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000029', '22222222-2222-2222-2222-000000000015', 4);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000029', '22222222-2222-2222-2222-000000000012', 4);

-- AVC (11..19): Pareza, Ameteala, Cefalee
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000019', '22222222-2222-2222-2222-000000000011', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000019', '22222222-2222-2222-2222-000000000010', 3);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000019', '22222222-2222-2222-2222-000000000009', 3);

-- Migrena (11..20): Cefalee severa, Varsaturi, Vertij
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000020', '22222222-2222-2222-2222-000000000009', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000020', '22222222-2222-2222-2222-000000000017', 4);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000020', '22222222-2222-2222-2222-000000000010', 3);

-- Anafilaxie (11..32): Angioedem, Dispnee, Eruptie
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000032', '22222222-2222-2222-2222-000000000031', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000032', '22222222-2222-2222-2222-000000000004', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000032', '22222222-2222-2222-2222-000000000029', 3);

-- Varicela (11..34): Eruptie, Prurit, Febra
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000034', '22222222-2222-2222-2222-000000000029', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000034', '22222222-2222-2222-2222-000000000030', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000034', '22222222-2222-2222-2222-000000000001', 3);

-- Glaucom acut (11..31): Durere oculara, Vedere tulbure, Varsaturi, Cefalee
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000031', '22222222-2222-2222-2222-000000000027', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000031', '22222222-2222-2222-2222-000000000028', 5);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000031', '22222222-2222-2222-2222-000000000017', 3);
INSERT INTO diseases_typical_symptoms (disease_id, symptom_id, relevance_score) VALUES ('11111111-1111-1111-1111-000000000031', '22222222-2222-2222-2222-000000000009', 3);



INSERT INTO evaluation_templates (id, name, slug, speciality, form_structure, scoring_logic) VALUES

-- 1. PNEUMOLOGIE (Infectii, Astm, Pneumonie, COVID)
('33333333-3333-3333-3333-000000000001', 'Triaj Respirator', 'eval-pneumo', 'Pneumologie',
  '{"title": "Evaluare Pneumologica", "questions": [
      {"id": "q1", "text": "Aveti senzatia de sufocare chiar si cand stati in repaus?", "type": "boolean"},
      {"id": "q2", "text": "Tusea a devenit productiva (cu sange sau puroi)?", "type": "boolean"},
      {"id": "q3", "text": "Apar zgomote suieratoare la respiratie?", "type": "boolean"}
  ]}',
  '{"thresholds": {"auto_treatment_max_complexity": 2}, "rules": [
      {"question_id": "q1", "expected_answer": "Da", "points": 8, "complexity_modifier": 3, "disease_id": "11111111-1111-1111-1111-000000000005"},
      {"question_id": "q2", "expected_answer": "Da", "points": 6, "complexity_modifier": 2, "disease_id": "11111111-1111-1111-1111-000000000002"},
      {"question_id": "q3", "expected_answer": "Da", "points": 6, "complexity_modifier": 2, "disease_id": "11111111-1111-1111-1111-000000000003"}
  ]}'
),

-- 2. CARDIOLOGIE (Infarct, HTA)
('33333333-3333-3333-3333-000000000002', 'Triaj Cardiovascular', 'eval-cardio', 'Cardiologie',
  '{"title": "Evaluare Cardiologica", "questions": [
      {"id": "q1", "text": "Durerea coboara pe bratul stang sau spre maxilar?", "type": "boolean"},
      {"id": "q2", "text": "Aveti senzatie de voma impreuna cu durerea din piept?", "type": "boolean"},
      {"id": "q3", "text": "Ati simtit inima batand neregulat si aveti transpiratii reci?", "type": "boolean"}
  ]}',
  '{"thresholds": {"auto_treatment_max_complexity": 1}, "rules": [
      {"question_id": "q1", "expected_answer": "Da", "points": 10, "complexity_modifier": 5, "disease_id": "11111111-1111-1111-1111-000000000011"},
      {"question_id": "q2", "expected_answer": "Da", "points": 5, "complexity_modifier": 3, "disease_id": "11111111-1111-1111-1111-000000000011"},
      {"question_id": "q3", "expected_answer": "Da", "points": 7, "complexity_modifier": 3, "disease_id": "11111111-1111-1111-1111-000000000012"}
  ]}'
),

-- 3. GASTROENTEROLOGIE (Apendicita, Toxiinfectie, Ulcer)
('33333333-3333-3333-3333-000000000003', 'Triaj Digestiv', 'eval-gastro', 'Gastroenterologie',
  '{"title": "Evaluare Gastroenterologica", "questions": [
      {"id": "q1", "text": "Durerea se accentueaza cand apasati in partea DREAPTA-JOS a abdomenului?", "type": "boolean"},
      {"id": "q2", "text": "Scaunele sunt exclusiv apoase / lichide?", "type": "boolean"},
      {"id": "q3", "text": "Durerea abdominala are aspect de arsura (in capul pieptului)?", "type": "boolean"}
  ]}',
  '{"thresholds": {"auto_treatment_max_complexity": 2}, "rules": [
      {"question_id": "q1", "expected_answer": "Da", "points": 10, "complexity_modifier": 4, "disease_id": "11111111-1111-1111-1111-000000000015"},
      {"question_id": "q2", "expected_answer": "Da", "points": 5, "complexity_modifier": 1, "disease_id": "11111111-1111-1111-1111-000000000014"},
      {"question_id": "q3", "expected_answer": "Da", "points": 6, "complexity_modifier": 2, "disease_id": "11111111-1111-1111-1111-000000000016"}
  ]}'
),

-- 4. NEUROLOGIE (AVC, Migrene, Epilepsie)
('33333333-3333-3333-3333-000000000004', 'Triaj Neurologic', 'eval-neuro', 'Neurologie',
  '{"title": "Evaluare Neurologica", "questions": [
      {"id": "q1", "text": "Ati pierdut forta sau simtul intr-o jumatate de corp?", "type": "boolean"},
      {"id": "q2", "text": "Lumina si zgomotul va agraveaza durerea de cap?", "type": "boolean"}
  ]}',
  '{"thresholds": {"auto_treatment_max_complexity": 2}, "rules": [
      {"question_id": "q1", "expected_answer": "Da", "points": 10, "complexity_modifier": 5, "disease_id": "11111111-1111-1111-1111-000000000019"},
      {"question_id": "q2", "expected_answer": "Da", "points": 6, "complexity_modifier": 2, "disease_id": "11111111-1111-1111-1111-000000000020"}
  ]}'
),

-- 5. PSIHIATRIE
('33333333-3333-3333-3333-000000000005', 'Triaj Psihiatric', 'eval-psihiatrie', 'Psihiatrie',
  '{"title": "Evaluare Psihiatrica", "questions": [
      {"id": "q1", "text": "Simtiti ca pierdeti controlul si ca urmeaza sa muriti/lesinati brusc?", "type": "boolean"}
  ]}',
  '{"thresholds": {"auto_treatment_max_complexity": 2}, "rules": [
      {"question_id": "q1", "expected_answer": "Da", "points": 8, "complexity_modifier": 2, "disease_id": "11111111-1111-1111-1111-000000000023"}
  ]}'
),

-- 6. GINECOLOGIE (Sarcina Extrauterina, Dismenoree)
('33333333-3333-3333-3333-000000000006', 'Triaj Ginecologic', 'eval-gineco', 'Ginecologie',
  '{"title": "Evaluare Ginecologica", "questions": [
      {"id": "q1", "text": "Exista posibilitatea sa fiti insarcinata?", "type": "boolean"},
      {"id": "q2", "text": "Durerea se coreleaza cu ciclul menstrual obisnuit?", "type": "boolean"}
  ]}',
  '{"thresholds": {"auto_treatment_max_complexity": 2}, "rules": [
      {"question_id": "q1", "expected_answer": "Da", "points": 10, "complexity_modifier": 4, "disease_id": "11111111-1111-1111-1111-000000000029"},
      {"question_id": "q2", "expected_answer": "Da", "points": 6, "complexity_modifier": 1, "disease_id": "11111111-1111-1111-1111-000000000028"}
  ]}'
),

-- 7. PEDIATRIE
('33333333-3333-3333-3333-000000000007', 'Triaj Pediatric', 'eval-pediatrie', 'Pediatrie',
  '{"title": "Evaluare Pediatrica", "questions": [
      {"id": "q1", "text": "Copilul refuza lichidele si este letargic/moale?", "type": "boolean"},
      {"id": "q2", "text": "Bubele/eruptia de pe corp au varf cu lichid transparent?", "type": "boolean"}
  ]}',
  '{"thresholds": {"auto_treatment_max_complexity": 2}, "rules": [
      {"question_id": "q1", "expected_answer": "Da", "points": 8, "complexity_modifier": 3, "disease_id": "11111111-1111-1111-1111-000000000014"},
      {"question_id": "q2", "expected_answer": "Da", "points": 8, "complexity_modifier": 2, "disease_id": "11111111-1111-1111-1111-000000000034"}
  ]}'
),

-- 8. OFTALMOLOGIE
('33333333-3333-3333-3333-000000000008', 'Triaj Oftalmologic', 'eval-oftalmo', 'Oftalmologie',
  '{"title": "Evaluare Oftalmologica", "questions": [
      {"id": "q1", "text": "Ochiul este extrem de rosu, dureros, iar vederea este in ceata?", "type": "boolean"},
      {"id": "q2", "text": "Ochiul e doar rosu, asociaza mancarime si secretii lipicioase?", "type": "boolean"}
  ]}',
  '{"thresholds": {"auto_treatment_max_complexity": 2}, "rules": [
      {"question_id": "q1", "expected_answer": "Da", "points": 10, "complexity_modifier": 5, "disease_id": "11111111-1111-1111-1111-000000000031"},
      {"question_id": "q2", "expected_answer": "Da", "points": 7, "complexity_modifier": 1, "disease_id": "11111111-1111-1111-1111-000000000030"}
  ]}'
),

-- 9. ALERGOLOGIE
('33333333-3333-3333-3333-000000000009', 'Triaj Alergologic', 'eval-alergie', 'Alergologie',
  '{"title": "Evaluare Alergii", "questions": [
      {"id": "q1", "text": "Limba sau buzele v-au crescut in volum brusc?", "type": "boolean"}
  ]}',
  '{"thresholds": {"auto_treatment_max_complexity": 2}, "rules": [
      {"question_id": "q1", "expected_answer": "Da", "points": 10, "complexity_modifier": 5, "disease_id": "11111111-1111-1111-1111-000000000032"}
  ]}'
),

-- 10. UROLOGIE (Cistita, Colica renala, Pielonefrita)
('33333333-3333-3333-3333-000000000010', 'Triaj Urologic', 'eval-uro', 'Urologie',
  '{"title": "Evaluare Urologica", "questions": [
      {"id": "q1", "text": "Durerea lombara iradiaza puternic spre zona inghinala?", "type": "boolean"},
      {"id": "q2", "text": "Urinati foarte des, cu cantitati mici si usturimi?", "type": "boolean"}
  ]}',
  '{"thresholds": {"auto_treatment_max_complexity": 2}, "rules": [
      {"question_id": "q1", "expected_answer": "Da", "points": 10, "complexity_modifier": 4, "disease_id": "11111111-1111-1111-1111-000000000026"},
      {"question_id": "q2", "expected_answer": "Da", "points": 6, "complexity_modifier": 1, "disease_id": "11111111-1111-1111-1111-000000000025"}
  ]}'
),

-- 11. DERMATOLOGIE
('33333333-3333-3333-3333-000000000011', 'Triaj Dermatologic', 'eval-dermato', 'Dermatologie',
  '{"title": "Evaluare Dermatologica", "questions": [
      {"id": "q1", "text": "Eruptia este reliefata, mananca intens si se muta de pe o zona pe alta?", "type": "boolean"}
  ]}',
  '{"thresholds": {"auto_treatment_max_complexity": 2}, "rules": [
      {"question_id": "q1", "expected_answer": "Da", "points": 8, "complexity_modifier": 2, "disease_id": "11111111-1111-1111-1111-000000000033"}
  ]}'
),

-- 12. ORTOPEDIE
('33333333-3333-3333-3333-000000000012', 'Triaj Ortopedic', 'eval-orto', 'Ortopedie',
  '{"title": "Evaluare Ortopedica", "questions": [
      {"id": "q1", "text": "Durerea a aparut brusc la ridicarea unei greutati / aplecare?", "type": "boolean"}
  ]}',
  '{"thresholds": {"auto_treatment_max_complexity": 2}, "rules": [
      {"question_id": "q1", "expected_answer": "Da", "points": 7, "complexity_modifier": 2, "disease_id": "11111111-1111-1111-1111-000000000037"}
  ]}'
),

-- 13. ORL
('33333333-3333-3333-3333-000000000013', 'Triaj ORL', 'eval-orl', 'ORL',
  '{"title": "Evaluare ORL", "questions": [
      {"id": "q1", "text": "Auziti infundat si simtiti presiune dureroasa in ureche?", "type": "boolean"}
  ]}',
  '{"thresholds": {"auto_treatment_max_complexity": 2}, "rules": [
      {"question_id": "q1", "expected_answer": "Da", "points": 7, "complexity_modifier": 2, "disease_id": "11111111-1111-1111-1111-000000000006"}
  ]}'
),

-- 14. MEDICINĂ GENERALĂ (Fallback)
('33333333-3333-3333-3333-000000000014', 'Triaj General', 'eval-general', 'Medicină Generală',
  '{"title": "Evaluare Generala", "questions": [
      {"id": "q1", "text": "Sunteti ametit si palid la fata de mai multe saptamani?", "type": "boolean"}
  ]}',
  '{"thresholds": {"auto_treatment_max_complexity": 2}, "rules": [
      {"question_id": "q1", "expected_answer": "Da", "points": 6, "complexity_modifier": 2, "disease_id": "11111111-1111-1111-1111-000000000016"}
  ]}'
);


INSERT INTO triage_rules (id, name, priority_level, gender, symptom_match_mode, min_symptom_count, template_id, is_emergency_alert, emergency_message) VALUES
('44444444-4444-4444-4444-000000000001', 'Neuro Urgenta AVC',       5, 'any', 'MIN_COUNT', 1, '33333333-3333-3333-3333-000000000004', TRUE, 'ALERTA AVC: Asimetrie faciala detectata. Apelati 112 imediat.'),
('44444444-4444-4444-4444-000000000002', 'Alergie Anafilaxie',      5, 'any', 'MIN_COUNT', 1, '33333333-3333-3333-3333-000000000009', TRUE, 'URGENTA SOC ANAFILACTIC. Utilizati Epipen si sunati la 112.'),
('44444444-4444-4444-4444-000000000003', 'Cardio Urgenta',          5, 'any', 'MIN_COUNT', 1, '33333333-3333-3333-3333-000000000002', FALSE, NULL),
('44444444-4444-4444-4444-000000000004', 'Oftalmo Urgenta',         4, 'any', 'MIN_COUNT', 1, '33333333-3333-3333-3333-000000000008', FALSE, NULL),
('44444444-4444-4444-4444-000000000005', 'Triaj Femei Ginecologie', 4, 'F',   'MIN_COUNT', 1, '33333333-3333-3333-3333-000000000006', FALSE, NULL),
('44444444-4444-4444-4444-000000000006', 'Triaj Pediatric Boli',    4, 'any', 'MIN_COUNT', 1, '33333333-3333-3333-3333-000000000007', FALSE, NULL),
('44444444-4444-4444-4444-000000000007', 'Triaj Urologic',          3, 'any', 'MIN_COUNT', 1, '33333333-3333-3333-3333-000000000010', FALSE, NULL),
('44444444-4444-4444-4444-000000000008', 'Triaj Psihiatrie',        3, 'any', 'MIN_COUNT', 1, '33333333-3333-3333-3333-000000000005', FALSE, NULL),
('44444444-4444-4444-4444-000000000009', 'Triaj Gastroenterologie', 3, 'any', 'MIN_COUNT', 1, '33333333-3333-3333-3333-000000000003', FALSE, NULL),
('44444444-4444-4444-4444-000000000010', 'Triaj Pneumologie',       2, 'any', 'MIN_COUNT', 1, '33333333-3333-3333-3333-000000000001', FALSE, NULL),
('44444444-4444-4444-4444-000000000011', 'Triaj Dermatologic',      2, 'any', 'MIN_COUNT', 1, '33333333-3333-3333-3333-000000000011', FALSE, NULL),
('44444444-4444-4444-4444-000000000012', 'Triaj Ortopedic',         2, 'any', 'MIN_COUNT', 1, '33333333-3333-3333-3333-000000000012', FALSE, NULL),
('44444444-4444-4444-4444-000000000013', 'Triaj ORL',               2, 'any', 'MIN_COUNT', 1, '33333333-3333-3333-3333-000000000013', FALSE, NULL),
('44444444-4444-4444-4444-000000000014', 'Fallback Medicina',       1, 'any', 'ANY',       1, '33333333-3333-3333-3333-000000000014', FALSE, NULL);



-- Neuro: Pareza
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000001', '22222222-2222-2222-2222-000000000011');

-- Alergie: Angioedem
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000002', '22222222-2222-2222-2222-000000000031');

-- Cardio: Durere piept, Palpitatii, Lesin
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000003', '22222222-2222-2222-2222-000000000013');
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000003', '22222222-2222-2222-2222-000000000014');
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000003', '22222222-2222-2222-2222-000000000012');

-- Oftalmo: Durere oculara, Ochi rosu
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000004', '22222222-2222-2222-2222-000000000027');
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000004', '22222222-2222-2222-2222-000000000026');

-- Gineco: Durere pelvina, Sangerare
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000005', '22222222-2222-2222-2222-000000000024');
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000005', '22222222-2222-2222-2222-000000000025');

-- Pediatrie: Eruptie cutanata
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000006', '22222222-2222-2222-2222-000000000029');

-- Urologie: Arsuri urinare, Sange urina, Durere lombara
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000007', '22222222-2222-2222-2222-000000000021');
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000007', '22222222-2222-2222-2222-000000000023');
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000007', '22222222-2222-2222-2222-000000000020');

-- Psihiatrie: Anxietate, Apatie
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000008', '22222222-2222-2222-2222-000000000032');
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000008', '22222222-2222-2222-2222-000000000033');

-- Gastro: Durere abdominala, Greata/Varsaturi, Diaree
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000009', '22222222-2222-2222-2222-000000000015');
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000009', '22222222-2222-2222-2222-000000000017');
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000009', '22222222-2222-2222-2222-000000000018');

-- Pneumo: Tuse, Dispnee
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000010', '22222222-2222-2222-2222-000000000002');
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000010', '22222222-2222-2222-2222-000000000003');
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000010', '22222222-2222-2222-2222-000000000004');

-- Dermato: Eruptie
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000011', '22222222-2222-2222-2222-000000000029');

-- Orto: Dureri articulare
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000012', '22222222-2222-2222-2222-000000000034');

-- ORL: Durere ureche, Nas infundat
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000013', '22222222-2222-2222-2222-000000000008');
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000013', '22222222-2222-2222-2222-000000000007');

-- General / Fallback (Simptome extrem de generice care rutează spre Medicina Generala)
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000014', '22222222-2222-2222-2222-000000000001');
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000014', '22222222-2222-2222-2222-000000000009');
INSERT INTO triage_rule_symptoms (rule_id, symptom_id) VALUES ('44444444-4444-4444-4444-000000000014', '22222222-2222-2222-2222-000000000010'); 