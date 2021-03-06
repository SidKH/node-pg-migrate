import { template } from "../utils";

const makeClauses = ({ role, using, check }) => {
  const roles = (Array.isArray(role) ? role : [role]).join(", ");
  const clauses = [];
  if (roles) {
    clauses.push(`TO ${roles}`);
  }
  if (using) {
    clauses.push(`USING (${using})`);
  }
  if (check) {
    clauses.push(`WITH CHECK (${check})`);
  }
  return clauses;
};

export const createPolicy = (tableName, policyName, options = {}) => {
  const createOptions = {
    ...options,
    role: options.role || "PUBLIC"
  };
  const clauses = [
    `FOR ${options.command || "ALL"}`,
    ...makeClauses(createOptions)
  ];
  const clausesStr = clauses.join(" ");
  return template`CREATE POLICY "${policyName}" ON "${tableName}" ${clausesStr};`;
};

export const alterPolicy = (tableName, policyName, options = {}) => {
  const clausesStr = makeClauses(options).join(" ");
  return template`ALTER POLICY "${policyName}" ON "${tableName}" ${clausesStr};`;
};

export const dropPolicy = (tableName, policyName, { ifExists } = {}) => {
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  return template`DROP POLICY${ifExistsStr} "${policyName}" ON "${tableName}";`;
};

export const renamePolicy = (tableName, policyName, newPolicyName) =>
  template`ALTER POLICY  "${policyName}" ON "${tableName}" RENAME TO "${newPolicyName}";`;

const undoRename = (tableName, policyName, newPolicyName) =>
  renamePolicy(tableName, newPolicyName, policyName);

// setup reverse functions
createPolicy.reverse = dropPolicy;
renamePolicy.reverse = undoRename;
