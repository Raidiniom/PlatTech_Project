CREATE POLICY "allow only Admin and Instructor"
on "public"."enrollment"
to public
using (
  EXISTS (
    SELECT 1
    FROM faculty
    WHERE (faculty.faculty_id = auth.uid())
      AND (faculty.role::text IN ('Admin', 'Instructor'))
  )
)
with check (
  EXISTS (
    SELECT 1
    FROM faculty
    WHERE (faculty.faculty_id = auth.uid())
      AND (faculty.role::text IN ('Admin', 'Instructor'))
  )
);