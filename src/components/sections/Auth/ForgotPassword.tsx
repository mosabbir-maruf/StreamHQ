import { Mail } from "@/utils/icons";
import { addToast, Button, Input } from "@heroui/react";
import { AuthFormProps } from "./Forms";
import { ForgotPasswordFormSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isEmpty } from "@/utils/helpers";
import { useCallback, useState } from "react";
import { sendResetPasswordEmail } from "@/actions/auth";
import TurnstileErrorBoundary from "@/components/ui/other/TurnstileErrorBoundary";

const AuthForgotPasswordForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ForgotPasswordFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (isEmpty(data.captchaToken)) {
      setIsVerifying(true);
      return;
    }

    const { success, message } = await sendResetPasswordEmail(data);

    if (!success) {
      setValue("captchaToken", undefined);
      setIsVerifying(false);
    }

    return addToast({
      title: message,
      color: success ? "success" : "danger",
      timeout: success ? Infinity : undefined,
    });
  });

  const onCaptchaSuccess = useCallback(
    (token: string) => {
      setValue("captchaToken", token);
      setIsVerifying(false);
      onSubmit();
    },
    [setValue, setIsVerifying, onSubmit],
  );

  const getButtonText = useCallback(() => {
    if (isSubmitting) return "Sending Email...";
    if (isVerifying) return "Verifying...";
    return "Send";
  }, [isSubmitting, isVerifying]);

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <p className="text-small text-foreground-500 mb-4 text-center">
        You'll receive an email with a link to reset your password
      </p>
      <Input
        {...register("email")}
        isInvalid={!!errors.email?.message}
        errorMessage={errors.email?.message}
        isRequired
        label="Email Address"
        name="email"
        placeholder="Enter your email"
        type="email"
        variant="underlined"
        startContent={<Mail className="text-xl" />}
        isDisabled={isSubmitting || isVerifying}
      />
      {isVerifying && (
        <TurnstileErrorBoundary
          onSuccess={onCaptchaSuccess}
          onError={(error) => {
            console.error("Turnstile error:", error);
            addToast({
              title: "Verification failed",
              description: "Please try again or refresh the page",
              color: "danger",
            });
            setIsVerifying(false);
          }}
        />
      )}
      <Button
        className="mt-3 w-full"
        color="primary"
        type="submit"
        variant="shadow"
        isLoading={isSubmitting || isVerifying}
      >
        {getButtonText()}
      </Button>
    </form>
  );
};

export default AuthForgotPasswordForm;
