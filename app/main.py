from app import dal

def print_rows(rows):
    if not rows:
        print("(no rows)")
        return
    for r in rows:
        print(r)

def menu():
    print("\n=== VulnVault Console ===")
    print("1) List vendors")
    print("2) List products")
    print("3) List vulnerabilities (latest 25)")
    print("4) List reports (latest 25)")
    print("5) Create vendor")
    print("6) Delete vendor")
    print("0) Quit")

def main():
    while True:
        menu()
        choice = input("Choice: ").strip()

        if choice == "1":
            print_rows(dal.list_vendors())

        elif choice == "2":
            print_rows(dal.list_products())

        elif choice == "3":
            print_rows(dal.list_vulnerabilities(25))

        elif choice == "4":
            print_rows(dal.list_reports(25))

        elif choice == "5":
            name = input("Vendor name: ").strip()
            website = input("Website (or blank): ").strip() or None
            created = dal.create_vendor(name, website)
            print("Created:", created)

        elif choice == "6":
            vid = int(input("Vendor ID to delete: ").strip())
            ok = dal.delete_vendor(vid)
            print("Deleted." if ok else "Not found (or FK restrict prevented deletion).")

        elif choice == "0":
            break

        else:
            print("Invalid choice.")

if __name__ == "__main__":
    main()
