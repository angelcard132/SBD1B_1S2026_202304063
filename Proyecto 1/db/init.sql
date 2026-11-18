-- SEQUENCES
CREATE SEQUENCE seq_centro START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_escuela START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_departamento START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_municipio START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_genero START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_rol START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_usuario START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_licencia START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_tramite START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_persona START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_instructor START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_cenescuela START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_fase START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_pregunta START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_respuesta START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_regis_evalua START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_regis_respu START WITH 1 INCREMENT BY 1;

-- TABLAS
CREATE TABLE CENTRO (
    idCentro        NUMBER NOT NULL,
    nombreCentro    VARCHAR2(150),
    direccionCentro VARCHAR2(300),
    fechaRegistro   DATE,
    usuarioRegistro VARCHAR2(50)
);
ALTER TABLE CENTRO ADD CONSTRAINT CENTRO_PK PRIMARY KEY (idCentro);

CREATE TABLE DEPARTAMENTO (
    idDepartamento     NUMBER NOT NULL,
    nombreDepartamento VARCHAR2(100)
);
ALTER TABLE DEPARTAMENTO ADD CONSTRAINT DEPARTAMENTO_PK PRIMARY KEY (idDepartamento);

CREATE TABLE Escuela (
    idEscuela        NUMBER NOT NULL,
    nombreEscuela    VARCHAR2(150),
    direccionEscuela VARCHAR2(300),
    autorizacionNo   VARCHAR2(50),
    fechaRegistro    DATE,
    usuarioRegistro  VARCHAR2(50)
);
ALTER TABLE Escuela ADD CONSTRAINT Escuela_PK PRIMARY KEY (idEscuela);

CREATE TABLE GENERO (
    idGenero          NUMBER NOT NULL,
    descripcionGenero VARCHAR2(20)
);
ALTER TABLE GENERO ADD CONSTRAINT GENERO_PK PRIMARY KEY (idGenero);

CREATE TABLE ROL (
    idRol          NUMBER NOT NULL,
    descripcionRol VARCHAR2(80)
);
ALTER TABLE ROL ADD CONSTRAINT ROL_PK PRIMARY KEY (idRol);

CREATE TABLE LICENCIA_TIPO (
    idTipoLicencia      NUMBER NOT NULL,
    codigoLicencia      CHAR(1),
    descripcionLicencia VARCHAR2(50)
);
ALTER TABLE LICENCIA_TIPO ADD CONSTRAINT LICENCIA_TIPO_PK PRIMARY KEY (idTipoLicencia);

CREATE TABLE TRAMITE_TIPO (
    idTipoTramite      NUMBER NOT NULL,
    descripcionTramite VARCHAR2(80)
);
ALTER TABLE TRAMITE_TIPO ADD CONSTRAINT TRAMITE_TIPO_PK PRIMARY KEY (idTipoTramite);

CREATE TABLE MUNICIPIO (
    idMunicipio                 NUMBER NOT NULL,
    nombreMunicipio             VARCHAR2(100),
    idDepartamento              NUMBER,
    DEPARTAMENTO_idDepartamento NUMBER NOT NULL
);
ALTER TABLE MUNICIPIO ADD CONSTRAINT MUNICIPIO_PK PRIMARY KEY (idMunicipio);

CREATE TABLE USUARIO (
    idUsuario     NUMBER NOT NULL,
    nombreUsuario VARCHAR2(100),
    contrasenia   VARCHAR2(250),
    estadoUsuario CHAR(1),
    idRol         NUMBER,
    fechaRegistro DATE,
    ROL_idRol     NUMBER NOT NULL
);
ALTER TABLE USUARIO ADD CONSTRAINT USUARIO_PK PRIMARY KEY (idUsuario);

CREATE TABLE fas_evalua (
    idFase           NUMBER NOT NULL,
    descripcionFase  VARCHAR2(80),
    totalPreguntas   NUMBER,
    valorPorPregunta NUMBER
);
ALTER TABLE fas_evalua ADD CONSTRAINT FASE_EVALUACION_PK PRIMARY KEY (idFase);

CREATE TABLE instruc (
    idInstructor     NUMBER NOT NULL,
    nombreInstructor VARCHAR2(200),
    identificacion   VARCHAR2(20),
    idCentro         NUMBER,
    fechaRegistro    DATE,
    usuarioRegistro  VARCHAR2(50),
    CENTRO_idCentro  NUMBER NOT NULL
);
ALTER TABLE instruc ADD CONSTRAINT INSTRUCTOR_PK PRIMARY KEY (idInstructor);

CREATE TABLE cenEscuela (
    idCentroEscuela   NUMBER NOT NULL,
    idCentro          NUMBER,
    idEscuela         NUMBER,
    fechaRegistro     DATE,
    CENTRO_idCentro   NUMBER NOT NULL,
    Escuela_idEscuela NUMBER NOT NULL
);
ALTER TABLE cenEscuela ADD CONSTRAINT centro_escuela_PK PRIMARY KEY (idCentroEscuela);

CREATE TABLE PERSONA (
    idPersona             NUMBER NOT NULL,
    nombrePersona         VARCHAR2(200),
    identificacion        VARCHAR2(20) NOT NULL,
    direccionPersona      VARCHAR2(300),
    telefono              VARCHAR2(15),
    fotografia            BLOB,
    fechaNacimiento       DATE,
    idGenero              NUMBER,
    idMunicipio           NUMBER,
    idEscuela             NUMBER,
    fechaRegistro         DATE,
    usuarioRegistro       VARCHAR2(50),
    Escuela_idEscuela     NUMBER NOT NULL,
    GENERO_idGenero       NUMBER NOT NULL,
    MUNICIPIO_idMunicipio NUMBER NOT NULL
);
ALTER TABLE PERSONA ADD CONSTRAINT PERSONA_PK PRIMARY KEY (idPersona);

CREATE TABLE pregun_fase (
    idPregunta             NUMBER NOT NULL,
    numeroPregunta         NUMBER,
    descPregunta           VARCHAR2(500),
    imagenPregunta         BLOB,
    idFase                 NUMBER,
    FASE_EVALUACION_idFase NUMBER NOT NULL
);
ALTER TABLE pregun_fase ADD CONSTRAINT PREGUNTA_FASE_PK PRIMARY KEY (idPregunta);

CREATE TABLE resp_pregunta (
    idRespuesta              NUMBER NOT NULL,
    noRespuesta              NUMBER,
    descRespuesta            VARCHAR2(300),
    imagenRespuesta          BLOB,
    esCorrecta               CHAR(1),
    valorRespuesta           NUMBER,
    idPregunta               NUMBER,
    PREGUNTA_FASE_idPregunta NUMBER NOT NULL
);
ALTER TABLE resp_pregunta ADD CONSTRAINT RESPUESTA_PREGUNTA_PK PRIMARY KEY (idRespuesta);

CREATE TABLE regis_evalua (
    idRegistro                   NUMBER NOT NULL,
    fechaRegistro                DATE,
    correlativoDia               NUMBER,
    resultadoTeorico             NUMBER,
    resultadoPractico            NUMBER,
    usuarioRegistro              VARCHAR2(50),
    idPersona                    NUMBER,
    idCentro                     NUMBER,
    idTipoLicencia               NUMBER,
    idTipoTramite                NUMBER,
    idInstructor                 NUMBER,
    PERSONA_idPersona            NUMBER NOT NULL,
    CENTRO_idCentro              NUMBER NOT NULL,
    LICENCIA_TIPO_idTipoLicencia NUMBER NOT NULL,
    TRAMITE_TIPO_idTipoTramite   NUMBER NOT NULL,
    INSTRUCTOR_idInstructor      NUMBER NOT NULL
);
ALTER TABLE regis_evalua ADD CONSTRAINT registro_evaluacion_PK PRIMARY KEY (idRegistro);

CREATE TABLE regis_respu (
    idRegistroRespuesta            NUMBER NOT NULL,
    idRegistro                     NUMBER,
    idPregunta                     NUMBER,
    idRespuesta                    NUMBER,
    fechaRegistro                  DATE,
    registro_evaluacion_idRegistro NUMBER NOT NULL,
    PREGUNTA_FASE_idPregunta       NUMBER NOT NULL,
    RESPUESTA_PREGUNTA_idRespuesta NUMBER NOT NULL
);
ALTER TABLE regis_respu ADD CONSTRAINT REGISTRO_RESPUESTA_PK PRIMARY KEY (idRegistroRespuesta);

-- FOREIGN KEYS
ALTER TABLE cenEscuela ADD CONSTRAINT centro_escuela_CENTRO_FK FOREIGN KEY (CENTRO_idCentro) REFERENCES CENTRO(idCentro);
ALTER TABLE cenEscuela ADD CONSTRAINT centro_escuela_Escuela_FK FOREIGN KEY (Escuela_idEscuela) REFERENCES Escuela(idEscuela);
ALTER TABLE instruc ADD CONSTRAINT INSTRUCTOR_CENTRO_FK FOREIGN KEY (CENTRO_idCentro) REFERENCES CENTRO(idCentro);
ALTER TABLE MUNICIPIO ADD CONSTRAINT mun_DEP_FK FOREIGN KEY (DEPARTAMENTO_idDepartamento) REFERENCES DEPARTAMENTO(idDepartamento);
ALTER TABLE PERSONA ADD CONSTRAINT per_esc_FK FOREIGN KEY (Escuela_idEscuela) REFERENCES Escuela(idEscuela);
ALTER TABLE PERSONA ADD CONSTRAINT per_muni_FK FOREIGN KEY (MUNICIPIO_idMunicipio) REFERENCES MUNICIPIO(idMunicipio);
ALTER TABLE PERSONA ADD CONSTRAINT pers_gen_FK FOREIGN KEY (GENERO_idGenero) REFERENCES GENERO(idGenero);
ALTER TABLE pregun_fase ADD CONSTRAINT pre_fase_fase_FK FOREIGN KEY (FASE_EVALUACION_idFase) REFERENCES fas_evalua(idFase);
ALTER TABLE regis_evalua ADD CONSTRAINT reg_instruc_FK FOREIGN KEY (INSTRUCTOR_idInstructor) REFERENCES instruc(idInstructor);
ALTER TABLE regis_evalua ADD CONSTRAINT reg_persona_FK FOREIGN KEY (PERSONA_idPersona) REFERENCES PERSONA(idPersona);
ALTER TABLE regis_evalua ADD CONSTRAINT reg_tramite_FK FOREIGN KEY (TRAMITE_TIPO_idTipoTramite) REFERENCES TRAMITE_TIPO(idTipoTramite);
ALTER TABLE regis_evalua ADD CONSTRAINT regi_licencia_FK FOREIGN KEY (LICENCIA_TIPO_idTipoLicencia) REFERENCES LICENCIA_TIPO(idTipoLicencia);
ALTER TABLE regis_evalua ADD CONSTRAINT regis_centro_FK FOREIGN KEY (CENTRO_idCentro) REFERENCES CENTRO(idCentro);
ALTER TABLE regis_respu ADD CONSTRAINT regis_resp_eval_FK FOREIGN KEY (registro_evaluacion_idRegistro) REFERENCES regis_evalua(idRegistro);
ALTER TABLE regis_respu ADD CONSTRAINT regis_resp_preg_FK FOREIGN KEY (RESPUESTA_PREGUNTA_idRespuesta) REFERENCES resp_pregunta(idRespuesta);
ALTER TABLE regis_respu ADD CONSTRAINT registro_resp_preg_FK FOREIGN KEY (PREGUNTA_FASE_idPregunta) REFERENCES pregun_fase(idPregunta);
ALTER TABLE resp_pregunta ADD CONSTRAINT resp_preg_fase_FK FOREIGN KEY (PREGUNTA_FASE_idPregunta) REFERENCES pregun_fase(idPregunta);
ALTER TABLE USUARIO ADD CONSTRAINT u_rol_FK FOREIGN KEY (ROL_idRol) REFERENCES ROL(idRol);