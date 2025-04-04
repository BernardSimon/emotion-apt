import { useState } from "react";
import { toast } from "react-hot-toast";
import { useUserInfo } from "~~/services/store/store";
import { UserInfo } from "~~/types/emotion-apt/UserInfo";
import { decryptWithEmbeddedSalt } from "~~/utils/emotion-apt/encrypt";

const PasswordModal = ({
  open,
  userInfo,
  onFinished,
  onForget,
}: {
  open: boolean;
  userInfo: UserInfo;
  onFinished: () => void;
  onForget: () => void;
}) => {
  const [password, setPassword] = useState("");
  const userStore = useUserInfo();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const msg = await decryptWithEmbeddedSalt(password, userInfo.valid_msg);
      if (msg === "emotion-apt") {
        toast.success("Login Successfully");
        setPassword(password);
        const name = await decryptWithEmbeddedSalt(password, userInfo.name);
        const sex = await decryptWithEmbeddedSalt(password, userInfo.sex);
        const date_of_birth = await decryptWithEmbeddedSalt(password, userInfo.date_of_birth);
        const education = await decryptWithEmbeddedSalt(password, userInfo.education);
        const occupation = await decryptWithEmbeddedSalt(password, userInfo.occupation);
        const counsellingHours = await decryptWithEmbeddedSalt(password, userInfo.counselling_hours);
        const orientations = await decryptWithEmbeddedSalt(password, userInfo.orientations);
        const techniques = await decryptWithEmbeddedSalt(password, userInfo.techniques);
        const userInfoDec = {
          valid_msg: userInfo.valid_msg,
          name,
          sex,
          date_of_birth,
          education,
          occupation: occupation,
          counselling_hours: counsellingHours,
          orientations,
          techniques,
        } as UserInfo;
        userStore.setUserInfo(userInfoDec);
        onFinished();
      } else {
        toast.error("Wrong Password");
        setPassword("");
      }
    } catch (e) {
      toast.error("Wrong Password");
      setPassword("");
    }
    // Handle form submission
  };
  return (
    <div id="init_modal" className={`modal ${open ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-5xl">
        <h2 className="text-2xl font-semibold mb-4">Please enter your password</h2>
        <p className="text-sm text-gray-500 mb-6">No one can access your data without your password</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <fieldset className="card bg-base-200 p-6">
            <legend className="text-lg font-bold mb-1">Basic Information</legend>
            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">* Data Password</span>
              </label>
              <input
                type="password"
                required
                className="input input-bordered"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </fieldset>

          {/* Form Actions */}
          <div className="modal-action">
            <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
              Login
            </button>
            <button type="button" className="btn" onClick={onForget}>
              Forget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
