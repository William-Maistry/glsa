export interface VehicleLicense {
  code: string;
  restriction: string;
  firstIssueDate: string;
}


export interface SALicenseData {

  idNumber: string;

  idNumberType: string;

  idCountryOfIssue: string;

  surname: string;

  initials: string;

  gender: string;

  birthDate: string;

  driverRestrictions: string;

  licenseCountryOfIssue: string;

  licenseIssueNumber: string;

  licenseNumber: string;

  licenseValidityStart: string;

  licenseValidityExpiry: string;

  professionalDrivingPermitExpiry:
    string | null;

  professionalDrivingPermitCodes:
    string[];

  vehicleLicenses:
    VehicleLicense[];

}