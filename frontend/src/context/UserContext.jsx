// import { createContext, useContext, useState } from "react";

// const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     designation: "",
//     department: "",
//     address: "",
//     dob: "",
//     gender: "",
//     image: "",
//     language: "English",
//     theme: "light",
//     // Add any other fields here as needed
//   });

//   const updateUser = (updatedFields) => {
//     setUser((prev) => ({
//       ...prev,
//       ...updatedFields,
//     }));
//   };

//   return (
//     <UserContext.Provider value={{ user, setUser: updateUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => useContext(UserContext);

import { createContext, useContext, useState } from "react";

// ✅ Add this export
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    department: "",
    address: "",
    dob: "",
    gender: "",
    image: "",
    language: "English",
    theme: "light",
    // Add any other fields here as needed
  });

  const updateUser = (updatedFields) => {
    setUser((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  return (
    <UserContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
