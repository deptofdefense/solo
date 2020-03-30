import React, { PropsWithChildren } from "react";
import { HeaderGroup } from "react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

interface TableHeadProps<T extends object> {
  headerGroups: HeaderGroup<T>[];
}

const TableHead = <T extends object>({
  headerGroups
}: PropsWithChildren<TableHeadProps<T>>) => (
  <thead>
    {headerGroups.map(headerGroup => {
      const { key, ...rest } = headerGroup.getHeaderGroupProps();
      return (
        <tr {...rest} key={key}>
          {headerGroup.headers.map(column => {
            const { key, ...rest } = column.getHeaderProps(
              column.getSortByToggleProps()
            );
            return (
              <th {...rest} key={key}>
                <div className="display-flex flex-justify flex-align-center flex-no-wrap text-no-wrap">
                  {column.render("Header")}
                  {!column.disableSortBy && (
                    <FontAwesomeIcon
                      icon={column.isSortedDesc ? faChevronDown : faChevronUp}
                      style={{
                        visibility: column.isSorted ? "visible" : "hidden"
                      }}
                      className="margin-left-05"
                    />
                  )}
                </div>
              </th>
            );
          })}
        </tr>
      );
    })}
  </thead>
);

export default TableHead;
