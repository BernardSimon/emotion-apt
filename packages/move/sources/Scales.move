module EmotionApt::scales {
  use std::string::{String};
  use std::signer;
  use std::vector;
  use aptos_framework::timestamp;

  // scale struct
  struct Scale has key, store, drop, copy {
      id: u64,
      name: String,
      description: String,
      content : String,
      price: u64,
  }

  struct Scales has key, store, drop, copy {
    scales: vector<Scale>,
  }

  struct PurchasedScales has key, store, drop, copy {
    ids: vector<u64>,
  }
  struct ScaleResult has key, store, drop, copy {
    scale:Scale,
    result: String,
    time: u64,
  }
  struct ScaleResults has key, store, drop, copy {
    results: vector<ScaleResult>,
  }


    const AlreadyPurchased: u64 = 30;
  const NoScales: u64 = 31;
  const BalanceNotEnough: u64 = 32;
  const NotPermission: u64 = 33;
  const NoPurchased: u64 = 34;

  public entry fun create_scales(account: &signer, name: String, description: String, content: String, price: u64) acquires Scales {
    let addr = signer::address_of(account);
    assert!(addr == @0x43b0d110918dd211814fb124a6a1ac9673f408e592f6a5811965062f2f4241b5, NotPermission );
    let oldScales = Scales {
      scales: vector<Scale>[],
    };
    if (exists<Scales>(signer::address_of(account))) {
      let _oldScales = move_from<Scales>(signer::address_of(account));
    };
    let new_id = vector::borrow(&oldScales.scales, vector::length(&oldScales.scales)-1).id+1;
    let record = Scale {
      id: new_id,
      name,
      description,
      content,
      price,
    };
    vector::push_back(&mut oldScales.scales, record);
    move_to<Scales>(account, oldScales);
  }
  // delete record
  public entry fun delete_scales(account: &signer, id: u64) acquires Scales {
    let addr = signer::address_of(account);
    assert!(addr == @0x43b0d110918dd211814fb124a6a1ac9673f408e592f6a5811965062f2f4241b5, NotPermission);
    assert!(exists<Scales>(addr), NoScales);
    let scales = move_from<Scales>(addr);
    let i = 0;
    let len = vector::length(&scales.scales);
    while (i < len) {
      let record = vector::borrow(&scales.scales, i);
      if (record.id == id) {
        vector::remove(&mut scales.scales, i);
        break
      } else {
        i = i + 1;
      }
    };
    move_to<Scales>(account, scales);
  }





  // add record
  public entry fun purchase_record(account: &signer, id: u64) acquires PurchasedScales, Scales {
    let addr = signer::address_of(account);
    let purchased = if (exists<PurchasedScales>(addr)) {
      move_from<PurchasedScales>(addr)
    } else {
      PurchasedScales { ids: vector[] }
    };
    purchased.ids.for_each(|existing_id| {
      assert!(existing_id != id, AlreadyPurchased);
    });
    let scale = get_scales(@0x43b0d110918dd211814fb124a6a1ac9673f408e592f6a5811965062f2f4241b5, id);
    let price: u64 = scale.price;
    assert!(aptos_framework::coin::balance<aptos_framework::aptos_coin::AptosCoin>(addr)>= price, BalanceNotEnough);
    aptos_framework::coin::transfer<aptos_framework::aptos_coin::AptosCoin>(account,@0x43b0d110918dd211814fb124a6a1ac9673f408e592f6a5811965062f2f4241b5,price);
    vector::push_back(&mut purchased.ids, id);
    move_to(account, purchased);
  }
  public entry fun add_result(account: &signer, id: u64, result: String) acquires ScaleResults, PurchasedScales, Scales {
    let addr = signer::address_of(account);
    let purchasedIds = get_purchased_scales(addr);
    assert!(purchasedIds.contains(&id),NoPurchased);
    let scaleResult = ScaleResult {
      scale: get_scales(@0x43b0d110918dd211814fb124a6a1ac9673f408e592f6a5811965062f2f4241b5, id),
      result,
      time: timestamp::now_seconds(),
    };
    let scaleResults = if (exists<ScaleResults>(addr)) {
      move_from<ScaleResults>(addr)
    } else {
      ScaleResults { results: vector[] }
    };
    scaleResults.results.push_back(scaleResult);
    move_to(account, scaleResults);
  }


  #[view]
  public fun get_scales(address: address, id: u64): Scale acquires Scales {
    assert!(exists<Scales>(address), NoScales);
    let records = borrow_global<Scales>(address);

    let i = 0;
    let len = vector::length(&records.scales);
    while (i < len) {
      let scale = vector::borrow(&records.scales, i);
      if (scale.id == id) {
        return *scale
      };
      i = i + 1;
    };

    abort NoScales
  }

  #[view]
  public fun get_purchased_scales(addr: address): vector<u64> acquires PurchasedScales {
    if (exists<PurchasedScales>(addr)) {
      let purchased = move_from<PurchasedScales>(addr);
      return purchased.ids
    } else {
      return vector[]
    }
  }
  #[view]
  public fun get_scale_results(addr: address): vector<ScaleResult> acquires ScaleResults {
    if (exists<ScaleResults>(addr)) {
      let scaleResults = move_from<ScaleResults>(addr);
      return scaleResults.results
    } else {
      return vector[]
    }
  }

}
