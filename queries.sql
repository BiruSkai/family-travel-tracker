-- Table: public.countries

-- DROP TABLE IF EXISTS public.countries;

CREATE TABLE IF NOT EXISTS public.countries
(
    id integer NOT NULL DEFAULT nextval('countries_id_seq'::regclass),
    country_code character(3) COLLATE pg_catalog."default",
    country_name character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT countries_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.countries
    OWNER to postgres;

-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    name character varying(15) COLLATE pg_catalog."default",
    color character varying(15) COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

-- Table: public.users_visitedcountries

-- DROP TABLE IF EXISTS public.users_visitedcountries;

CREATE TABLE IF NOT EXISTS public.users_visitedcountries
(
    user_id integer NOT NULL,
    country_code character(3) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_visitedcountries_pkey PRIMARY KEY (user_id, country_code),
    CONSTRAINT users_visitedcountries_country_code_fkey FOREIGN KEY (country_code)
        REFERENCES public.visited_countries (country_code) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT users_visitedcountries_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users_visitedcountries
    OWNER to postgres;

-- Table: public.visited_countries

-- DROP TABLE IF EXISTS public.visited_countries;

CREATE TABLE IF NOT EXISTS public.visited_countries
(
    id integer NOT NULL DEFAULT nextval('visited_countries_id_seq'::regclass),
    country_code character(2) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT visited_countries_pkey PRIMARY KEY (id),
    CONSTRAINT visited_countries_country_code_key UNIQUE (country_code)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.visited_countries
    OWNER to postgres;