export type RoleGlobal = "ADMIN" | "CHEF_EQUIPE" | "MEMBRE"
export type Priorite = "CRITIQUE" | "HAUTE" | "MOYENNE" | "BASSE"
export type StatutProjet = "A_FAIRE" | "EN_COURS" | "EN_PAUSE" | "TERMINE" | "ANNULE"
export type StatutTache = "PLANIFIEE" | "A_FAIRE" | "EN_COURS" | "EN_REVUE" | "TERMINEE" | "BLOQUEE"
export type Periodicite = "CONTINU" | "HEBDOMADAIRE" | "MENSUEL" | "TRIMESTRIEL" | "SEMESTRIEL" | "ANNUEL" | "A_LA_DEMANDE"

export interface User {
    id: number
    nom: string
    prenom: string
    email: string
    roleGlobal: RoleGlobal
    avatarUrl?: string
    telephone?: string
    actif: boolean
    dateCreation: string
}

export interface Equipe {
    id: number
    nom: string
    description?: string
    dateCreation: string
    createdBy: User
    nombreMembres: number
    membres: EquipeMembre[]
}

export interface EquipeMembre {
    userId: number
    nom: string
    prenom: string
    email: string
    roleEquipe: string
    dateAjout: string
}

export interface TypeProjet {
    id: number
    code: string
    libelle: string
    description?: string
    actif: boolean
    tachesModeles: TacheModele[]
}

export interface TacheModele {
    id: number
    titre: string
    description?: string
    priorite: string
    ordre: number
    delaiJours?: number
}

export interface Projet {
    id: number
    nom: string
    description?: string
    equipeId: number
    equipeNom: string
    typeProjetId: number
    typeProjetLibelle: string
    priorite: Priorite
    statut: StatutProjet
    dateDebut?: string
    dateFinPrevue?: string
    dateFinReelle?: string
    pourcentageProgression: number
    dateCreation: string
    nombreTaches: number
    tachesTerminees: number
    tachesEnRetard: number
    membres: ProjetMembre[]
}

export interface ProjetMembre {
    id: number
    userId: number
    nomComplet: string
    email: string
    roleProjet: string
}

export interface Tache {
    id: number
    titre: string
    description?: string
    projetId: number
    projetNom: string
    typeProjetLibelle?: string
    tacheParentId?: number
    estModele: boolean
    priorite: Priorite
    statut: StatutTache
    dateDebut?: string
    dateEcheance?: string
    dateFinReelle?: string
    pourcentage: number
    estRecurrente: boolean
    periodicite?: Periodicite
    regleRecurrence?: string
    dureeEstimeeHeures?: number
    dateRealisee?: string
    prochaineOccurrence?: string
    occurrenceNumero?: number
    tacheRecurrenteParentId?: number
    enRetard: boolean
    joursRetard: number
    assignees: TacheAssignee[]
    sousTaches?: Tache[]
    dateCreation: string
}

export interface TacheAssignee {
    id: number
    userId: number
    nomComplet: string
    email: string
    roleTache: string
}

export interface Notification {
    id: number
    titre: string
    message: string
    type: string
    referenceType?: string
    referenceId?: number
    lue: boolean
    dateCreation: string
}

export interface DashboardStats {
    totalProjets: number
    projetsActifs: number
    projetsTermines: number
    totalTaches: number
    tachesTerminees: number
    tachesEnRetard: number
    totalEquipes: number
    totalUtilisateurs: number
}

export interface DashboardAlertes {
    stats: DashboardStats
    mesTachesEnCours: Tache[]
    tachesEnRetard: Tache[]
    tachesProchesDeadline: Tache[]
}
