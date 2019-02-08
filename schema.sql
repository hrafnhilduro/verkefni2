CREATE TABLE applications (
  -- TODO schema fyrir töflu
  id serial primary key,
  name varchar(64) not null,
  email varchar(320) not null,
  phonenumber varchar(8),
  presentation varchar(1000),
  job varchar(60),
  processed boolean not null default false,
  created timestamp not null
    default current_timestamp,
  updated timestamp not NULL
    default current_timestamp
);
