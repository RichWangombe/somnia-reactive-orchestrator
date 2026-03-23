// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library RuleTypes {
    enum TriggerKind {
        PRICE_UPDATED,
        VAULT_HEALTH_CHANGED,
        TOKEN_TRANSFER,
        CUSTOM_EVENT
    }

    enum ConditionKind {
        LT,
        LTE,
        GT,
        GTE,
        EQ
    }

    enum ActionKind {
        WITHDRAW_FROM_VAULT,
        SWAP_TO_STABLE,
        EMIT_ONLY
    }

    enum TemplateKind {
        GUARDIAN,
        TREASURY,
        COMPOUND
    }

    struct TriggerSpec {
        TriggerKind kind;
        address contractAddress;
        bytes32[4] topicFilters;
        bytes filterData;
    }

    struct ConditionSpec {
        ConditionKind kind;
        uint256 threshold;
        bytes auxData;
    }

    struct ActionSpec {
        ActionKind kind;
        address moduleAddress;
        bytes data;
    }

    struct RuleLimits {
        uint64 cooldownSeconds;
        uint32 maxExecutionsPerDay;
    }

    struct RuleMetadata {
        string name;
        TemplateKind templateKind;
        uint64 createdAt;
        uint64 updatedAt;
    }

    struct Rule {
        address owner;
        bool active;
        TriggerSpec trigger;
        ConditionSpec condition;
        ActionSpec action;
        RuleLimits limits;
        RuleMetadata metadata;
    }
}
