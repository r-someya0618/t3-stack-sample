type Props = {
  image?: string | null;
  id?: string | null;
  name?: string | null;
};

export const UserIcon = ({ id, image, name }: Props) => {
  console.log(id);
  return (
    /* eslint-disable-next-line */
    <img
      src={
        image ??
        `https://source.boringavatars.com/beam/120/${
          id ?? ""
        }?colors=264653,2a9d8f,e9c46a,f4a261,e76f5`
      }
      alt={name ?? ""}
      className="rounded-full border bg-cover"
    />
  );
};
