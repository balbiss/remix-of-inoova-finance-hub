-- Permitir usuarios deletarem seus proprios lembretes
DROP POLICY IF EXISTS "Usuarios deletam seus lembretes" ON public.reminders;
CREATE POLICY "Usuarios deletam seus lembretes"
ON public.reminders
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);