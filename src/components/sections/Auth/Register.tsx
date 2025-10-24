import { signUp } from "@/actions/auth";
import { Google, LockPassword, Mail, User, Check } from "@/utils/icons";
import { addToast, Button, Divider, Input, Link } from "@heroui/react";
import { AuthFormProps } from "./Forms";
import { RegisterFormSchema } from "@/schemas/auth";
import PasswordInput from "@/components/ui/input/PasswordInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCallback, useState } from "react";
import { isEmpty } from "@/utils/helpers";
import GoogleLoginButton from "@/components/ui/button/GoogleLoginButton";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import TurnstileErrorBoundary from "@/components/ui/other/TurnstileErrorBoundary";

const AuthRegisterForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    watch,
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(RegisterFormSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirm: "",
    },
  });

  // Username availability check
  const currentUsername = watch("username");
  const usernameAvailability = useUsernameAvailability(currentUsername);

  const onSubmit = handleSubmit(async (data) => {
    if (isEmpty(data.captchaToken)) {
      setIsVerifying(true);
      return;
    }

    const { success, message } = await signUp(data);

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
    if (isSubmitting) return "Signing Up...";
    if (isVerifying) return "Verifying...";
    return "Sign Up";
  }, [isSubmitting, isVerifying]);

  return (
    <div className="flex flex-col gap-5">
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <p className="text-small text-foreground-500 mb-4 text-center">
          Join to track your favorites and watch history
        </p>
        <div className="space-y-1">
          <Input
            {...register("username")}
            isInvalid={!!errors.username?.message}
            errorMessage={errors.username?.message}
            isRequired
            label="Username"
            placeholder="Enter your username"
            variant="underlined"
            startContent={<User className="text-xl" />}
            endContent={
              currentUsername && currentUsername.length >= 4 && usernameAvailability.isLoading ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : currentUsername && currentUsername.length >= 4 && usernameAvailability.isAvailable === true ? (
                <div className="w-4 h-4 text-success">✓</div>
              ) : currentUsername && currentUsername.length >= 4 && usernameAvailability.isAvailable === false ? (
                <div className="w-4 h-4 text-danger">X</div>
              ) : null
            }
            isDisabled={isSubmitting || isVerifying}
          />
          {/* Real-time availability feedback */}
          {currentUsername && currentUsername.length >= 4 && (
            <div className="text-xs">
              {usernameAvailability.isLoading && (
                <span className="text-primary">Checking availability...</span>
              )}
              {usernameAvailability.isAvailable === true && (
                <span className="text-success">✓ Username is available</span>
              )}
              {usernameAvailability.isAvailable === false && (
                <span className="text-danger">X Username is already taken</span>
              )}
              {usernameAvailability.error && (
                <span className="text-warning">⚠ Error checking username</span>
              )}
            </div>
          )}
        </div>
        <Input
          {...register("email")}
          isInvalid={!!errors.email?.message}
          errorMessage={errors.email?.message}
          isRequired
          label="Email Address"
          placeholder="Enter your email"
          type="email"
          variant="underlined"
          startContent={<Mail className="text-xl" />}
          isDisabled={isSubmitting || isVerifying}
        />
        <PasswordInput
          value={watch("password")}
          {...register("password")}
          isInvalid={!!errors.password?.message}
          errorMessage={errors.password?.message}
          isRequired
          variant="underlined"
          label="Password"
          placeholder="Enter your password"
          startContent={<LockPassword className="text-xl" />}
          isDisabled={isSubmitting || isVerifying}
        />
        <PasswordInput
          {...register("confirm")}
          isInvalid={!!errors.confirm?.message}
          errorMessage={errors.confirm?.message}
          isRequired
          variant="underlined"
          label="Confirm Password"
          placeholder="Confirm your password"
          startContent={<LockPassword className="text-xl" />}
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
      <div className="flex items-center gap-4 py-2">
        <Divider className="flex-1" />
        <p className="text-tiny text-default-500 shrink-0">OR</p>
        <Divider className="flex-1" />
      </div>
      <GoogleLoginButton isDisabled={isSubmitting || isVerifying} />
      <p className="text-small text-center">
        Already have an account?
        <Link
          isBlock
          onClick={() => setForm("login")}
          size="sm"
          className="cursor-pointer"
          isDisabled={isSubmitting || isVerifying}
        >
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default AuthRegisterForm;
