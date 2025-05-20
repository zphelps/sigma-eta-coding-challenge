type AlertType = "out-of-zone" | "api-error";

interface Alert {
    clinicianId: number;
    type: AlertType;
    message: string;
    createdAt: Date;
}

class AlertService {
    private alerts: Map<number, Alert>;

    constructor() {
        this.alerts = new Map();
    }


    addAlert(alert: Alert) {
        this.alerts.set(alert.clinicianId, alert);
    }

    deleteAlert(clinicianId: number) {
        this.alerts.delete(clinicianId);
    }

    getAlertForClinician(clinicianId: number) {
        return this.alerts.get(clinicianId);
    }

}

export { AlertService, Alert };