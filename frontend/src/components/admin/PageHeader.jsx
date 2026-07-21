import React from "react";

const PageHeader = ({ title, description, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
      {description ? (
        <p className="text-sm text-slate-500 font-medium mt-1">{description}</p>
      ) : null}
    </div>
    {action}
  </div>
);

export default PageHeader;
