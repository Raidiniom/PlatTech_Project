CREATE TABLE Course (
  course_id bigint primary key generated always as identity,
  course_name text not null unique
);

CREATE TABLE Faculty (
  faculty_id uuid primary key,
  role text not null,
  email_address text not null unique,

  foreign key (faculty_id) references auth.users(id) on delete cascade
);

CREATE TABLE Student (
  student_id uuid primary key ,
  name text not null,
  email_address text not null unique
);

CREATE TABLE Enrollment (
  enrollment_id bigint primary key generated always as identity,
  faculty_id uuid not null,
  student_id uuid not null,
  course_id bigint not null,
  enrolled_date date not null,
  enrollment_status int not null default 0 check (enrollment_status in (0, 1, 2)),

  foreign key (student_id) references Student(student_id) on delete cascade,
  foreign key (course_id) references Course(course_id) on delete cascade,
  foreign key (faculty_id) references Faculty(faculty_id) on delete cascade
);