"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";

const registrationSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  kingschat_username: z.string().optional(),
  designation: z.string().optional(),
  title: z.string().optional(),
  age_group: z.string().optional(),
  zone_id: z.string().min(1, "Please select a zone"),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface Zone {
  id: string;
  name: string;
  slug: string;
}

interface RegistrationFormProps {
  onSuccess?: (registrationId: string) => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      first_name: "",
      surname: "",
      kingschat_username: "",
      designation: "",
      title: "",
      age_group: "",
      zone_id: "",
    },
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    const { data, error: fetchError } = await supabase
      .from("zones")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("name");

    if (fetchError) {
      setError("Failed to load zones. Please try again later.");
      return;
    }
    setZones((data ?? []).map((z) => ({ id: z.id, name: z.name, slug: z.slug })));
  };

  const checkDuplicate = async (values: RegistrationFormValues): Promise<boolean> => {
    const { data, error: checkError } = await supabase
      .from("registrations")
      .select("id")
      .eq("first_name", values.first_name.trim())
      .eq("surname", values.surname.trim())
      .eq("zone_id", values.zone_id)
      .maybeSingle();

    if (checkError) {
      return false;
    }
    return !!data;
  };

  const onSubmit = async (values: RegistrationFormValues) => {
    setError(null);
    setDuplicate(false);
    setSubmitting(true);

    try {
      const isDup = await checkDuplicate(values);
      if (isDup) {
        setDuplicate(true);
        setSubmitting(false);
        return;
      }

      const { data, error: insertError } = await supabase
        .from("registrations")
        .insert([
          {
            first_name: values.first_name.trim(),
            surname: values.surname.trim(),
            kingschat_username: values.kingschat_username?.trim() || null,
            designation: values.designation?.trim() || null,
            title: values.title?.trim() || null,
            age_group: values.age_group?.trim() || null,
            zone_id: values.zone_id,
            registration_status: "registered",
            payment_status: "unpaid",
            registration_source: "public",
          },
        ])
        .select("id")
        .single();

      if (insertError) {
        setError(insertError.message || "Registration failed. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      onSuccess?.(data.id);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <span className="text-green-600 font-bold text-2xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Registration complete</h2>
        <p className="text-muted-foreground mb-6 max-w-xs">
          Thank you for registering for ITYPLC 2027. Your registration has been received.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="First name"
            id="first_name"
            {...register("first_name")}
            error={errors.first_name?.message}
          />
          <FormField
            label="Surname"
            id="surname"
            {...register("surname")}
            error={errors.surname?.message}
          />
        </div>

        <FormField
          label="KingsChat username"
          id="kingschat_username"
          placeholder="Optional"
          {...register("kingschat_username")}
          helperText="Your KingsChat username for conference communication"
        />

        <FormField
          label="Designation"
          id="designation"
          placeholder="e.g. Pastor, Youth Leader"
          {...register("designation")}
        />

        <FormField
          label="Title"
          id="title"
          placeholder="e.g. Rev., Dr."
          {...register("title")}
        />

        <FormField
          label="Age group"
          id="age_group"
          placeholder="e.g. 13-17, 18-25"
          {...register("age_group")}
        />

        <div className="space-y-1">
          <label htmlFor="zone_id">Zone</label>
          <select
            id="zone_id"
            {...register("zone_id")}
            disabled={submitting}
            className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.zone_id ? "border-destructive" : ""
            }`}
          >
            <option value="" disabled>Select your zone</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
          {errors.zone_id && <p className="mt-1 text-xs text-destructive">{errors.zone_id.message}</p>}
        </div>
      </div>

      {duplicate && (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Duplicate registration</p>
          <p>A registration with this name already exists in your selected zone.</p>
        </div>
      )}

      {error && (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Registration error</p>
          <p>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || duplicate}
        className="w-full rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
      >
        {isSubmitting ? "Submitting..." : "Register"}
      </button>
    </form>
  );
}

interface FormFieldProps {
  label: string;
  id: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  [key: string]: unknown;
}

function FormField({
  label,
  id,
  placeholder,
  helperText,
  error,
  disabled,
  ...rest
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? "border-destructive" : ""
        }`}
        {...(rest as Record<string, unknown>)}
      />
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
