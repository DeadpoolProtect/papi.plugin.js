//META{"name":"OwnerCrown","displayName":"Owner Crown","website":"https://github.com/DeadpoolProtect/papi.plugin.js","source":"https://github.com/DeadpoolProtect/papi.plugin.js/blob/main/papi.plugin.js"}*//

const OwnerCrown = (() => {
  const config = {
      info: {
          name: "OwnerCrown",
          authors: [
              {
                  name: "Deadpool"
              }
          ],
          version: "1.0.0",
          description: "Affiche une couronne à côté du nom du propriétaire du serveur."
      }
  };

  return class {
      getName() {
          return config.info.name;
      }

      getAuthor() {
          return config.info.authors.map(author => author.name).join(", ");
      }

      getVersion() {
          return config.info.version;
      }

      getDescription() {
          return config.info.description;
      }

      load() {
          // Rien à faire ici
      }

      start() {
          const ServerMembers = BdApi.findModuleByProps("getMembers", "getOwnerID");
          const UserStore = BdApi.findModuleByProps("getUser");

          BdApi.Patcher.after("OwnerCrown", ServerMembers, "getMembers", (_, args, returnValue) => {
              const ownerId = ServerMembers.getOwnerID(...args);
              const members = [...returnValue];
              
              members.forEach(member => {
                  if (member.userId === ownerId) {
                      const user = UserStore.getUser(member.userId);
                      if (user) {
                          user.isOwner = true;
                      }
                  }
              });

              return members;
          });

          BdApi.Patcher.after("OwnerCrown", UserStore, "getUser", (_, args, returnValue) => {
              if (returnValue && returnValue.isOwner) {
                  returnValue.avatar += " ownerCrown";
              }
              
              return returnValue;
          });

          const style = document.createElement("style");
          style.innerHTML = `
              .avatar-3EQepX.ownerCrown {
                  position: relative;
              }
              .avatar-3EQepX.ownerCrown::after {
                  content: "";
                  position: absolute;
                  top: -2px;
                  right: -2px;
                  width: 12px;
                  height: 12px;
                  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-15H11v8l6.25 3.75L17.5 15l-5.5-3.25L6.5 15l.75-5.25L2 8V5h10.5z'/%3E%3C/svg%3E");
                  background-size: cover;
              }
          `;
          document.head.appendChild(style);
      }

      stop() {
          BdApi.Patcher.unpatchAll("OwnerCrown");
          const style = document.querySelector(".avatar-3EQepX.ownerCrown");
          if (style) style.remove();
      }
  };
})();

