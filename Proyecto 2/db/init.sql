ALTER SESSION SET CONTAINER = XEPDB1;
ALTER SESSION SET CURRENT_SCHEMA = EVALUACION_USER;


-- SEQUENCES
CREATE SEQUENCE seq_departamento START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_municipio    START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_centro       START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_escuela      START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_ubicacion    START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_pregunta     START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_preg_prac    START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_correlativo  START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_registro     START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_examen       START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_resp_user    START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_resp_prac    START WITH 1 INCREMENT BY 1;

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE DEPARTAMENTO (
    ID_DEPARTAMENTO NUMBER NOT NULL,
    NOMBRE          VARCHAR2(100),
    CODIGO          VARCHAR2(10)
);
ALTER TABLE DEPARTAMENTO ADD CONSTRAINT DEPARTAMENTO_PK PRIMARY KEY (ID_DEPARTAMENTO);

CREATE TABLE MUNICIPIO (
    ID_MUNICIPIO                 NUMBER NOT NULL,
    DEPARTAMENTO_ID_DEPARTAMENTO NUMBER NOT NULL,
    NOMBRE                       VARCHAR2(100),
    CODIGO                       VARCHAR2(10)
);
ALTER TABLE MUNICIPIO ADD CONSTRAINT MUNICIPIO_PK PRIMARY KEY (ID_MUNICIPIO);

CREATE TABLE CENTRO (
    ID_CENTRO NUMBER NOT NULL,
    NOMBRE    VARCHAR2(150)
);
ALTER TABLE CENTRO ADD CONSTRAINT CENTRO_PK PRIMARY KEY (ID_CENTRO);

CREATE TABLE ESCUELA (
    ID_ESCUELA NUMBER NOT NULL,
    NOMBRE     VARCHAR2(150),
    DIRECCION  VARCHAR2(300),
    ACUERDO    VARCHAR2(50)
);
ALTER TABLE ESCUELA ADD CONSTRAINT ESCUELA_PK PRIMARY KEY (ID_ESCUELA);

CREATE TABLE UBICACION (
    ID_UBICACION       NUMBER NOT NULL,
    ESCUELA_ID_ESCUELA NUMBER NOT NULL,
    CENTRO_ID_CENTRO   NUMBER NOT NULL
);
ALTER TABLE UBICACION ADD CONSTRAINT UBICACION_PK PRIMARY KEY (ID_UBICACION);

CREATE TABLE PREGUNTAS (
    ID_PREGUNTA    NUMBER NOT NULL,
    PREGUNTA_TEXTO VARCHAR2(500),
    RESPUESTA      NUMBER,
    RES1           VARCHAR2(300),
    RES2           VARCHAR2(300),
    RES3           VARCHAR2(300),
    RES4           VARCHAR2(300)
);
ALTER TABLE PREGUNTAS ADD CONSTRAINT PREGUNTAS_PK PRIMARY KEY (ID_PREGUNTA);

CREATE TABLE PREGUNTAS_PRACTICO (
    ID_PREGUNTA_PRACTICO NUMBER NOT NULL,
    PREGUNTA_TEXTO       VARCHAR2(500),
    PUNTEO               NUMBER
);
ALTER TABLE PREGUNTAS_PRACTICO ADD CONSTRAINT PREGUNTAS_PRACTICO_PK PRIMARY KEY (ID_PREGUNTA_PRACTICO);

CREATE TABLE CORRELATIVO (
    ID_CORRELATIVO NUMBER NOT NULL,
    FECHA          DATE,
    NO_EXAMEN      NUMBER
);
ALTER TABLE CORRELATIVO ADD CONSTRAINT CORRELATIVO_PK PRIMARY KEY (ID_CORRELATIVO);

CREATE TABLE REGISTRO (
    ID_REGISTRO                            NUMBER NOT NULL,
    UBICACION_ESCUELA_ID_ESCUELA           NUMBER NOT NULL,
    UBICACION_CENTRO_ID_CENTRO             NUMBER NOT NULL,
    MUNICIPIO_ID_MUNICIPIO                 NUMBER NOT NULL,
    MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO NUMBER NOT NULL,
    FECHA                                  DATE,
    TIPO_TRAMITE                           VARCHAR2(50),
    TIPO_LICENCIA                          VARCHAR2(5),
    NOMBRE_COMPLETO                        VARCHAR2(200),
    GENERO                                 CHAR(1)
);
ALTER TABLE REGISTRO ADD CONSTRAINT REGISTRO_PK PRIMARY KEY (ID_REGISTRO);

CREATE TABLE EXAMEN (
    ID_EXAMEN                                       NUMBER NOT NULL,
    REGISTRO_ID_ESCUELA                             NUMBER NOT NULL,
    REGISTRO_ID_CENTRO                              NUMBER NOT NULL,
    REGISTRO_MUNICIPIO_ID_MUNICIPIO                 NUMBER NOT NULL,
    REGISTRO_MUNICIPIO_DEPARTAMENTO_ID_DEPARTAMENTO NUMBER NOT NULL,
    REGISTRO_ID_REGISTRO                            NUMBER NOT NULL,
    CORRELATIVO_ID_CORRELATIVO                      NUMBER NOT NULL
);
ALTER TABLE EXAMEN ADD CONSTRAINT EXAMEN_PK PRIMARY KEY (ID_EXAMEN);

CREATE TABLE RESPUESTA_USUARIO (
    ID_RESPUESTA_USUARIO NUMBER NOT NULL,
    PREGUNTA_ID_PREGUNTA NUMBER NOT NULL,
    EXAMEN_ID_EXAMEN     NUMBER NOT NULL,
    RESPUESTA            NUMBER
);
ALTER TABLE RESPUESTA_USUARIO ADD CONSTRAINT RESPUESTA_USUARIO_PK PRIMARY KEY (ID_RESPUESTA_USUARIO);

CREATE TABLE RESPUESTA_PRACTICO_USUARIO (
    ID_RESPUESTA_PRACTICO                  NUMBER NOT NULL,
    PREGUNTA_PRACTICO_ID_PREGUNTA_PRACTICO NUMBER NOT NULL,
    EXAMEN_ID_EXAMEN                       NUMBER NOT NULL,
    NOTA                                   NUMBER
);
ALTER TABLE RESPUESTA_PRACTICO_USUARIO ADD CONSTRAINT RESP_PRAC_PK PRIMARY KEY (ID_RESPUESTA_PRACTICO);

-- ============================================================
-- FOREIGN KEYS
-- ============================================================
ALTER TABLE MUNICIPIO ADD CONSTRAINT mun_dep_FK
    FOREIGN KEY (DEPARTAMENTO_ID_DEPARTAMENTO) REFERENCES DEPARTAMENTO(ID_DEPARTAMENTO);

ALTER TABLE UBICACION ADD CONSTRAINT ubic_esc_FK
    FOREIGN KEY (ESCUELA_ID_ESCUELA) REFERENCES ESCUELA(ID_ESCUELA);

ALTER TABLE UBICACION ADD CONSTRAINT ubic_cen_FK
    FOREIGN KEY (CENTRO_ID_CENTRO) REFERENCES CENTRO(ID_CENTRO);

ALTER TABLE REGISTRO ADD CONSTRAINT reg_mun_FK
    FOREIGN KEY (MUNICIPIO_ID_MUNICIPIO) REFERENCES MUNICIPIO(ID_MUNICIPIO);

ALTER TABLE EXAMEN ADD CONSTRAINT exam_reg_FK
    FOREIGN KEY (REGISTRO_ID_REGISTRO) REFERENCES REGISTRO(ID_REGISTRO);

ALTER TABLE EXAMEN ADD CONSTRAINT exam_corr_FK
    FOREIGN KEY (CORRELATIVO_ID_CORRELATIVO) REFERENCES CORRELATIVO(ID_CORRELATIVO);

ALTER TABLE RESPUESTA_USUARIO ADD CONSTRAINT resp_user_preg_FK
    FOREIGN KEY (PREGUNTA_ID_PREGUNTA) REFERENCES PREGUNTAS(ID_PREGUNTA);

ALTER TABLE RESPUESTA_USUARIO ADD CONSTRAINT resp_user_exam_FK
    FOREIGN KEY (EXAMEN_ID_EXAMEN) REFERENCES EXAMEN(ID_EXAMEN);

ALTER TABLE RESPUESTA_PRACTICO_USUARIO ADD CONSTRAINT resp_prac_preg_FK
    FOREIGN KEY (PREGUNTA_PRACTICO_ID_PREGUNTA_PRACTICO) REFERENCES PREGUNTAS_PRACTICO(ID_PREGUNTA_PRACTICO);

ALTER TABLE RESPUESTA_PRACTICO_USUARIO ADD CONSTRAINT resp_prac_exam_FK
    FOREIGN KEY (EXAMEN_ID_EXAMEN) REFERENCES EXAMEN(ID_EXAMEN);

-- ============================================================
-- DATOS - DEPARTAMENTOS
-- ID: Guatemala=1, Sacatepéquez=2, Escuintla=3
-- ============================================================
INSERT INTO DEPARTAMENTO VALUES (seq_departamento.NEXTVAL, 'Guatemala', '01');
INSERT INTO DEPARTAMENTO VALUES (seq_departamento.NEXTVAL, 'Sacatepéquez', '03');
INSERT INTO DEPARTAMENTO VALUES (seq_departamento.NEXTVAL, 'Escuintla', '05');

-- ============================================================
-- DATOS - MUNICIPIOS
-- ID: Guatemala=1, Mixco=2, Villa Nueva=3, Escuintla=4, Antigua Guatemala=5
-- ============================================================
INSERT INTO MUNICIPIO VALUES (seq_municipio.NEXTVAL, 1, 'Guatemala', '01');
INSERT INTO MUNICIPIO VALUES (seq_municipio.NEXTVAL, 1, 'Mixco', '02');
INSERT INTO MUNICIPIO VALUES (seq_municipio.NEXTVAL, 1, 'Villa Nueva', '03');
INSERT INTO MUNICIPIO VALUES (seq_municipio.NEXTVAL, 3, 'Escuintla', '01');
INSERT INTO MUNICIPIO VALUES (seq_municipio.NEXTVAL, 2, 'Antigua Guatemala', '01');

-- ============================================================
-- DATOS - CENTROS
-- ID: Zona 12=1, Antigua=2, Escuintla=3
-- ============================================================
INSERT INTO CENTRO VALUES (seq_centro.NEXTVAL, 'Centro de Evaluación Zona 12');
INSERT INTO CENTRO VALUES (seq_centro.NEXTVAL, 'Centro de Evaluación Antigua Guatemala');
INSERT INTO CENTRO VALUES (seq_centro.NEXTVAL, 'Centro de Evaluación Escuintla');

-- ============================================================
-- DATOS - ESCUELAS
-- ID: AutoMaster=1, GuateDrive=2, Conducción Segura=3
-- ============================================================
INSERT INTO ESCUELA VALUES (seq_escuela.NEXTVAL, 'Escuela de Manejo AutoMaster', 'Avenida Reforma 15-45, Zona 10', 'ESC-AM-001');
INSERT INTO ESCUELA VALUES (seq_escuela.NEXTVAL, 'Academia Vial GuateDrive', 'Boulevard Los Próceres 18-20, Zona 10', 'ESC-GD-002');
INSERT INTO ESCUELA VALUES (seq_escuela.NEXTVAL, 'Instituto de Conducción Segura', 'Calzada Roosevelt 25-30, Zona 11', 'ESC-ICS-003');

-- ============================================================
-- DATOS - UBICACION
-- escuela 1 -> centro 1
-- escuela 1 -> centro 2
-- escuela 2 -> centro 1
-- escuela 3 -> centro 2
-- escuela 3 -> centro 3
-- ============================================================
INSERT INTO UBICACION VALUES (seq_ubicacion.NEXTVAL, 1, 1);
INSERT INTO UBICACION VALUES (seq_ubicacion.NEXTVAL, 1, 2);
INSERT INTO UBICACION VALUES (seq_ubicacion.NEXTVAL, 2, 1);
INSERT INTO UBICACION VALUES (seq_ubicacion.NEXTVAL, 3, 2);
INSERT INTO UBICACION VALUES (seq_ubicacion.NEXTVAL, 3, 3);

-- ============================================================
-- DATOS - PREGUNTAS TEORICAS
-- respuesta_correcta A=1, B=2, C=3, D=4
-- P1: correcta B=2, P2: correcta B=2, P3: correcta A=1, P4: correcta C=3
-- ============================================================
INSERT INTO PREGUNTAS VALUES (seq_pregunta.NEXTVAL, '¿Cuál es la distancia mínima que debe mantener entre vehículos en carretera?', 2, '2 metros', '3 segundos de distancia', '5 metros', '1 segundo de distancia');
INSERT INTO PREGUNTAS VALUES (seq_pregunta.NEXTVAL, '¿Qué significa una señal de alto?', 2, 'Reducir velocidad', 'Detenerse completamente', 'Ceder el paso', 'Continuar con precaución');
INSERT INTO PREGUNTAS VALUES (seq_pregunta.NEXTVAL, '¿Cuál es el límite de velocidad en zona escolar?', 1, '20 km/h', '30 km/h', '40 km/h', '50 km/h');
INSERT INTO PREGUNTAS VALUES (seq_pregunta.NEXTVAL, '¿Qué debe hacer al ver una ambulancia con sirena activada?', 3, 'Mantener velocidad', 'Acelerar para salir del camino', 'Orillarse y detenerse', 'Ignorar la sirena');

-- ============================================================
-- DATOS - PREGUNTAS PRACTICO
-- ============================================================
INSERT INTO PREGUNTAS_PRACTICO VALUES (seq_preg_prac.NEXTVAL, 'Realizar estacionamiento en paralelo en un espacio de 6 metros', 20);
INSERT INTO PREGUNTAS_PRACTICO VALUES (seq_preg_prac.NEXTVAL, 'Conducir en reversa por 50 metros manteniendo trayectoria recta', 15);
INSERT INTO PREGUNTAS_PRACTICO VALUES (seq_preg_prac.NEXTVAL, 'Maniobra de tres puntos en espacio reducido', 25);
INSERT INTO PREGUNTAS_PRACTICO VALUES (seq_preg_prac.NEXTVAL, 'Conducción en zona urbana respetando señales de tránsito', 30);

-- ============================================================
-- DATOS - CORRELATIVO
-- ============================================================
INSERT INTO CORRELATIVO VALUES (seq_correlativo.NEXTVAL, TO_DATE('2025-01-15','YYYY-MM-DD'), 1);
INSERT INTO CORRELATIVO VALUES (seq_correlativo.NEXTVAL, TO_DATE('2025-01-15','YYYY-MM-DD'), 2);
INSERT INTO CORRELATIVO VALUES (seq_correlativo.NEXTVAL, TO_DATE('2025-01-16','YYYY-MM-DD'), 3);
INSERT INTO CORRELATIVO VALUES (seq_correlativo.NEXTVAL, TO_DATE('2025-01-17','YYYY-MM-DD'), 4);
INSERT INTO CORRELATIVO VALUES (seq_correlativo.NEXTVAL, TO_DATE('2025-01-18','YYYY-MM-DD'), 5);

-- ============================================================
-- DATOS - REGISTRO (5 personas)
-- ============================================================
INSERT INTO REGISTRO VALUES (seq_registro.NEXTVAL, 1, 1, 1, 1, TO_DATE('2025-01-15','YYYY-MM-DD'), 'Licencia de Conducir', 'A', 'Juan Carlos López García', 'M');
INSERT INTO REGISTRO VALUES (seq_registro.NEXTVAL, 1, 2, 2, 1, TO_DATE('2025-01-15','YYYY-MM-DD'), 'Licencia de Conducir', 'B', 'María Elena Rodríguez Morales', 'F');
INSERT INTO REGISTRO VALUES (seq_registro.NEXTVAL, 2, 1, 3, 1, TO_DATE('2025-01-16','YYYY-MM-DD'), 'Licencia de Conducir', 'A', 'Carlos Alberto Méndez Castillo', 'M');
INSERT INTO REGISTRO VALUES (seq_registro.NEXTVAL, 3, 3, 4, 3, TO_DATE('2025-01-17','YYYY-MM-DD'), 'Licencia de Conducir', 'A', 'Ana Sofía Guerrero Díaz', 'F');
INSERT INTO REGISTRO VALUES (seq_registro.NEXTVAL, 2, 2, 5, 2, TO_DATE('2025-01-18','YYYY-MM-DD'), 'Licencia de Conducir', 'B', 'Pedro José Hernández Ruiz', 'M');


INSERT INTO EXAMEN VALUES (seq_examen.NEXTVAL, 1, 1, 1, 1, 1, 1);
INSERT INTO EXAMEN VALUES (seq_examen.NEXTVAL, 1, 2, 2, 1, 2, 2);
INSERT INTO EXAMEN VALUES (seq_examen.NEXTVAL, 2, 1, 3, 1, 3, 3);
INSERT INTO EXAMEN VALUES (seq_examen.NEXTVAL, 3, 3, 4, 3, 4, 4);
INSERT INTO EXAMEN VALUES (seq_examen.NEXTVAL, 2, 2, 5, 2, 5, 5);


INSERT INTO RESPUESTA_USUARIO VALUES (seq_resp_user.NEXTVAL, 1, 1, 2);
INSERT INTO RESPUESTA_USUARIO VALUES (seq_resp_user.NEXTVAL, 2, 1, 2);
INSERT INTO RESPUESTA_USUARIO VALUES (seq_resp_user.NEXTVAL, 3, 2, 1);
INSERT INTO RESPUESTA_USUARIO VALUES (seq_resp_user.NEXTVAL, 4, 2, 3);
INSERT INTO RESPUESTA_USUARIO VALUES (seq_resp_user.NEXTVAL, 1, 3, 2);
INSERT INTO RESPUESTA_USUARIO VALUES (seq_resp_user.NEXTVAL, 2, 3, 1);


INSERT INTO RESPUESTA_PRACTICO_USUARIO VALUES (seq_resp_prac.NEXTVAL, 1, 1, 18);
INSERT INTO RESPUESTA_PRACTICO_USUARIO VALUES (seq_resp_prac.NEXTVAL, 2, 1, 13);
INSERT INTO RESPUESTA_PRACTICO_USUARIO VALUES (seq_resp_prac.NEXTVAL, 3, 2, 22);
INSERT INTO RESPUESTA_PRACTICO_USUARIO VALUES (seq_resp_prac.NEXTVAL, 4, 2, 28);
INSERT INTO RESPUESTA_PRACTICO_USUARIO VALUES (seq_resp_prac.NEXTVAL, 1, 3, 15);

COMMIT;