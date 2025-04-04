module EmotionApt::user_info {
  use std::string::{String};
  use std::signer;
  use EmotionApt::records;

  // UserInfo struct
  struct UserInfo has key, store, drop, copy {
      valid_msg: String,
      name: String,
      sex: String,
      date_of_birth: String,
      education: String,
      occupation: String,
      counselling_hours:String,
      orientations: String,
      techniques: String,
  }
  // Error codes
  const NoUserInfoError: u64 = 10;

  public entry fun register(account: &signer, valid_msg: String, name: String, sex: String, date_of_birth: String, education: String, occupation: String, counselling_hours:String, orientations: String, techniques: String ) acquires UserInfo {
    // Check if an UserInfo already exists for the account
    if (exists<UserInfo>(signer::address_of(account))) {
      // Remove the existing UserInfo
      let _old_user_info = move_from<UserInfo>(signer::address_of(account));
    };
    // Create the new UserInfo
    let userInfo = UserInfo {
      valid_msg,
      name,
      sex,
      date_of_birth,
      education,
      occupation,
      counselling_hours,
      orientations,
      techniques,
    };
    // Store the new UserInfo under the account
    move_to<UserInfo>(account, userInfo);
    records::init(account)
  }
    public entry fun delete(account: &signer) acquires UserInfo {
        // Check if an UserInfo already exists for the account
        if (exists<UserInfo>(signer::address_of(account))) {
            // Remove the existing UserInfo
            let _old_user_info = move_from<UserInfo>(signer::address_of(account));
        };
        records::init(account)
    }
  //
  #[view]
  public fun get_user_info_self(address: address): UserInfo  acquires UserInfo {
    assert!(exists<UserInfo>(address), NoUserInfoError);
    let userInfo = borrow_global<UserInfo>(address);
    *userInfo
  }

}
