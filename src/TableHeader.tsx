import { ArrowUpIcon, SearchIcon } from "@sanity/icons";
import { Button, Card, Flex, Stack, TextInput } from "@sanity/ui";
import { motion } from "motion/react";
import { useMemo } from "react";

import { useTableContext } from "./TableProvider";
import type { HeaderProps, TableHeaderProps } from "./types";

type ButtonProps = React.ComponentProps<typeof Button>;

const MotionIcon = motion.create(ArrowUpIcon);

const BasicHeader = ({
  text,
  headerProps,
}: HeaderProps & {
  text: string;
}) => (
  <Button
    {...headerProps}
    mode="bleed"
    text={text}
    disabled
    style={{ cursor: "default" }}
  />
);

const SortHeaderButton = ({
  header,
  text,
}: Omit<ButtonProps, "text"> &
  HeaderProps & {
    text: string;
  }) => {
  const { sort, setSortColumn } = useTableContext();
  const sortIcon = useMemo(
    () => (
      <MotionIcon
        initial={false}
        animate={{ rotate: sort?.direction === "asc" ? 0 : 180 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />
    ),
    [sort?.direction]
  );

  return (
    <Button
      iconRight={
        header.sorting && sort?.column === header.id ? sortIcon : undefined
      }
      onClick={() => setSortColumn(String(header.id))}
      mode="bleed"
      size="default"
      text={text}
    />
  );
};

const TableHeaderSearch = ({
  headerProps,
  searchDisabled,
  placeholder = "Search…",
}: HeaderProps & { placeholder?: string }) => {
  const { setSearchTerm, searchTerm } = useTableContext();

  return (
    <Stack
      {...headerProps}
      flex={1}
      paddingY={2}
      paddingRight={3}
      sizing="border"
    >
      <TextInput
        border={false}
        fontSize={1}
        icon={SearchIcon}
        placeholder={placeholder}
        radius={3}
        value={searchTerm || ""}
        disabled={searchDisabled}
        onChange={(event) => setSearchTerm(event.currentTarget.value)}
        onClear={() => setSearchTerm("")}
        clearButton={!!searchTerm}
      />
    </Stack>
  );
};

export const TableHeader = ({ headers, searchDisabled }: TableHeaderProps) => {
  return (
    <Card as="thead" borderBottom>
      <Flex
        as="tr"
        style={{
          paddingInline: `max(
          calc((100% - var(--maxInlineSize)) / 2),
          var(--paddingInline)
        )`,
        }}
      >
        {headers.map(
          ({ header: Header, style, width, id, sorting }) =>
            !!Header && (
              <Header
                key={String(id)}
                headerProps={{
                  as: "th",
                  id: String(id),
                  style: { ...style, width: width || undefined },
                }}
                header={{ id, sorting }}
                searchDisabled={searchDisabled}
              />
            )
        )}
      </Flex>
    </Card>
  );
};

/**
 * Pre-built header renderers. Pass these as the `header` prop on a column
 * definition to get sort + search affordances without rolling your own.
 */
export const Headers = {
  SortHeaderButton,
  TableHeaderSearch,
  BasicHeader,
};
