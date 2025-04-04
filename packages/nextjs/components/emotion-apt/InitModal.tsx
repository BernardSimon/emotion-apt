import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSubmitTransaction from "~~/hooks/scaffold-move/useSubmitTransaction";
import { useGlobalState, useUserInfo } from "~~/services/store/store";
import { UserInfo } from "~~/types/emotion-apt/UserInfo";
import { encryptWithEmbeddedSalt } from "~~/utils/emotion-apt/encrypt";

const InitModal = ({ open, onFinished, onClosed }: { open: boolean; onClosed: () => void; onFinished: () => void }) => {
  const [nickName, setNickName] = useState("");
  const [password, setPassword] = useState("");
  const [sex, setSex] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [showOtherEducation, setShowOtherEducation] = useState(false);
  const [education, setEducation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [showCounselingHours, setShowCounselingHours] = useState(false);
  const [counselingHours, setCounselingHours] = useState("");
  const [selectedOrientations, setSelectedOrientations] = useState<string[]>([]);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [showOtherOrientationSpecify, setShowOtherOrientationSpecify] = useState(false);
  const [showTechniqueOtherSpecify, setShowTechniqueOtherSpecify] = useState(false);
  const { submitTransaction, transactionResponse } = useSubmitTransaction("user_info");
  const store = useGlobalState();
  const userProfile = useUserInfo();

  useEffect(() => {
    if (transactionResponse?.transactionSubmitted) {
      if (transactionResponse.success) {
        onFinished();
        toast.success("Save your Account Information Successful");
        store.setPassword(password);
        setPassword("");
      } else {
        toast.error("Save your Account Information Failed");
      }
    }
  }, [transactionResponse]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const set_valid_msg = await encryptWithEmbeddedSalt(password, "emotion-apt");
    const set_name = await encryptWithEmbeddedSalt(password, nickName);
    const set_sex = await encryptWithEmbeddedSalt(password, sex);
    const set_birth_date = await encryptWithEmbeddedSalt(password, birthDate);
    const set_occupation = await encryptWithEmbeddedSalt(password, occupation);
    const set_education = await encryptWithEmbeddedSalt(password, education);
    const set_counseling_hours = await encryptWithEmbeddedSalt(password, counselingHours);
    const set_orientation = await encryptWithEmbeddedSalt(password, selectedOrientations.join(","));
    const set_technique = await encryptWithEmbeddedSalt(password, selectedTechniques.join(","));
    try {
      await submitTransaction("register", [
        set_valid_msg,
        set_name,
        set_sex,
        set_birth_date,
        set_education,
        set_occupation,
        set_counseling_hours,
        set_orientation,
        set_technique,
      ]);
      userProfile.setUserInfo({
        valid_msg: set_valid_msg,
        name: nickName,
        sex: sex,
        date_of_birth: birthDate,
        education: education,
        occupation: occupation,
        counselling_hours: counselingHours,
        orientations: selectedOrientations.join(","),
        techniques: selectedTechniques.join(","),
      } as UserInfo);
    } catch (e) {
      toast.error("Failed to submit transaction");
    }
    // Handle form submission
  };

  const handleOrientationChange = (value: string) => {
    setSelectedOrientations(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
    if (value === "Other") {
      setShowOtherOrientationSpecify(!showOtherOrientationSpecify);
    }
  };

  const handleTechniqueChange = (value: string) => {
    setSelectedTechniques(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
    if (value === "Other") {
      setShowTechniqueOtherSpecify(!showTechniqueOtherSpecify);
    }
  };

  return (
    <div id="init_modal" className={`modal ${open ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-5xl">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Emotion APT</h2>
        <p className="text-sm text-gray-500 mb-6">
          Store your information on the chain, NO ONE can get it without your permission
        </p>
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
                placeholder="Please remember your password"
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {/* Nick Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">* Nick Name</span>
              </label>
              <input
                type="text"
                required
                className="input input-bordered"
                value={nickName}
                onChange={e => setNickName(e.target.value)}
              />
            </div>

            {/* Gender */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">* Sex</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {["Male", "Female", "Other", "Prefer not to disclose"].map(option => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sex"
                      value={option}
                      required
                      className="radio radio-primary"
                      checked={sex === option}
                      onChange={e => setSex(e.target.value)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Birth Date */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Date of Birth (Optional)</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
              />
            </div>

            {/* Education Level */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Education Level (Optional)</span>
              </label>
              <select
                className="select select-bordered"
                onChange={e => {
                  setShowOtherEducation(e.target.value === "Other");
                  if (e.target.value !== "Other") {
                    setEducation(e.target.value);
                  }
                }}
              >
                {[
                  "Not Provided",
                  "Primary School",
                  "Junior High School",
                  "Senior High School",
                  "Vocational School",
                  "College",
                  "Bachelor's Degree",
                  "Master's Degree",
                  "Doctoral Degree",
                  "Other",
                ].map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {showOtherEducation && (
                <input
                  type="text"
                  placeholder="Specify (Optional)"
                  className="input input-bordered mt-2"
                  onChange={e => setEducation(e.target.value)}
                />
              )}
            </div>

            {/* Occupation */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Occupation (Optional)</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={occupation}
                onChange={e => setOccupation(e.target.value)}
              />
            </div>
          </fieldset>

          {/* Counseling Information */}
          <fieldset className="card bg-base-200 p-6">
            <legend className="text-lg font-bold mb-1">Counseling Information</legend>

            {/* Counseling Experience */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Have you tried psychological counseling before? (Optional)</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="counseling"
                    className="radio radio-primary"
                    onChange={() => {
                      setShowCounselingHours(true);

                    }}
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="counseling"
                    className="radio radio-primary"
                    onChange={() => {
                      setShowCounselingHours(false);
                      setCounselingHours("0");
                    }}
                  />
                  <span>No</span>
                </label>
              </div>
              {showCounselingHours && (
                <input
                  type="number"
                  placeholder="Number of counseling hours (Optional)"
                  className="input input-bordered mt-2"
                  onChange={e => setCounselingHours(e.target.value)}
                />
              )}
            </div>

            {/* Theoretical Orientation */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Theoretical Orientation (Multiple, Optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "None",
                  "Psychoanalysis",
                  "Psychodynamic",
                  "Existentialism",
                  "Postmodern",
                  "Narrative Therapy",
                  "CBT (Cognitive Behavioral Therapy)",
                  "Family Therapy",
                  "Couples Counseling",
                  "EFT (Emotion-Focused Therapy)",
                  "Gestalt",
                  "Brief Solution-Focused Therapy",
                  "Other",
                ].map(option => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selectedOrientations.includes(option)}
                      onChange={() => handleOrientationChange(option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {showOtherOrientationSpecify && (
                <input type="text" placeholder="Specify (Optional)" className="input input-bordered mt-2" />
              )}
            </div>

            {/* Preferred Counseling Techniques */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Preferred Counseling Techniques (Multiple, Optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "None",
                  "Sandplay",
                  "Oh Cards",
                  "Psychological Assessment Scales",
                  "Mindfulness Meditation",
                  "Family Constellations",
                  "Empty Chair Dialogue",
                  "Other",
                ].map(option => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selectedTechniques.includes(option)}
                      onChange={() => handleTechniqueChange(option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {showTechniqueOtherSpecify && (
                <input type="text" placeholder="Specify (Optional)" className="input input-bordered mt-2" />
              )}
            </div>
          </fieldset>

          {/* Form Actions */}
          <div className="modal-action">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <button type="button" className="btn" onClick={onClosed}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InitModal;
