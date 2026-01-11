-- Permitir usuarios deletarem seus proprios lembretes
CREATE POLICY "Usuarios deletam seus lembretes"
ON public.reminders
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);