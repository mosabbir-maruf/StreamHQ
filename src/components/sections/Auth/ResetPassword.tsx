import { resetPassword } from "@/actions/auth";
import PasswordInput from "@/components/ui/input/PasswordInput";
import { ResetPasswordFormSchema } from "@/schemas/auth";
import { env } from "@/utils/env";
import { isEmpty } from "@/utils/helpers";
import { LockPassword } from "@/utils/icons";
import { useRouter } from "@bprogress/next/app";
import { addToast, Button } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import TurnstileErrorBoundary from "@/components/ui/other/TurnstileErrorBoundary";

const AuthResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    watch,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ResetPasswordFormSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirm: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (isEmpty(data.captchaToken)) {
      setIsVerifying(true);
      return;
    }

    const { success, message } = await resetPassword(data);

    addToast({
      title: message,
      color: success ? "success" : "danger",
    });

    if (!success) {
      setValue("captchaToken", undefined);
      setIsVerifying(false);
      return;
    }

    return router.push("/");
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
    if (isSubmitting) return "Resetting Password...";
    if (isVerifying) return "Verifying...";
    return "Reset Password";
  }, [isSubmitting, isVerifying]);

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <p className="text-small text-foreground-500 mb-4 text-center">
        Please enter your new password to continue your streaming journey
      </p>
      <PasswordInput
        {...register("password")}
        value={watch("password")}
        isInvalid={!!errors.password?.message}
        errorMessage={errors.password?.message}
        isRequired
        variant="underlined"
        label="New Password"
        placeholder="Enter your new password"
        startContent={<LockPassword className="text-xl" />}
      />
      <PasswordInput
        {...register("confirm")}
        isInvalid={!!errors.confirm?.message}
        errorMessage={errors.confirm?.message}
        isRequired
        variant="underlined"
        label="Confirm Password"
        placeholder="Confirm your new password"
        startContent={<LockPassword className="text-xl" />}
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

export default AuthResetPasswordForm;
