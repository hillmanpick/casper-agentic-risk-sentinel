#![no_main]
#![no_std]

extern crate alloc;

use alloc::string::{String, ToString};
use casper_contract::contract_api::{runtime, storage};
use casper_types::{
    contracts::{EntryPoint, EntryPointAccess, EntryPointType, EntryPoints, NamedKeys},
    CLType, CLValue, Key, Parameter, RuntimeArgs, URef,
};

const REVIEWS_KEY: &str = "risk_sentinel_reviews";
const CONTRACT_NAME: &str = "risk_review_registry";

#[no_mangle]
pub extern "C" fn record_review() {
    let review_id: String = runtime::get_named_arg("review_id");
    let review_hash: String = runtime::get_named_arg("review_hash");
    let decision: String = runtime::get_named_arg("decision");
    let action_category: String = runtime::get_named_arg("action_category");

    let dictionary_uref: URef = runtime::get_key(REVIEWS_KEY)
        .and_then(Key::into_uref)
        .unwrap_or_revert();

    let packed_record = [review_hash, decision, action_category].join("|");
    storage::dictionary_put(dictionary_uref, &review_id, packed_record);
}

#[no_mangle]
pub extern "C" fn call() {
    let reviews = storage::new_dictionary(REVIEWS_KEY).unwrap_or_revert();

    let mut entry_points = EntryPoints::new();
    entry_points.add_entry_point(EntryPoint::new(
        "record_review",
        vec![
            Parameter::new("review_id", CLType::String),
            Parameter::new("review_hash", CLType::String),
            Parameter::new("decision", CLType::String),
            Parameter::new("action_category", CLType::String),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    let mut named_keys = NamedKeys::new();
    named_keys.insert(REVIEWS_KEY.to_string(), reviews.into());

    let (contract_hash, _contract_version) =
        storage::new_contract(entry_points, Some(named_keys), Some(CONTRACT_NAME.to_string()), None);

    runtime::put_key(CONTRACT_NAME, contract_hash.into());
    runtime::ret(CLValue::from_t(()).unwrap_or_revert());
}
