import { Agendamento } from "../entities/agendamento";
import {validate} from "class-validator";
import { Cliente } from "../entities/cliente";


export class AgendamentoOperations{
    agendamentoOrm:any;

    async saveAgendamentos(connection,agendamentos,bodycpf){
        let arrRet = [];
        for(let ag of agendamentos){        
            let a;a=ag;
            this.agendamentoOrm = new Agendamento();
            this.agendamentoOrm.cpf = bodycpf;
            this.agendamentoOrm.name = a.name;
            this.agendamentoOrm.value = a.value;
            this.agendamentoOrm.data = a.data;
            this.agendamentoOrm.horario = a.horario;
            this.agendamentoOrm.idAgendamento = a.id;
            let err:any = new Promise((resolve)=>validate(this.agendamentoOrm).then(errors => {
                    resolve(errors);
            }))
            let errAwait = await err;
            switch(errAwait.length >0) { 
                case true : { 
                    arrRet.push(errAwait);
                   break; 
                } 
                default: { 
                    arrRet.push(await connection.manager.save(this.agendamentoOrm));
                   break; 
                } 
            } 

        }
        return await arrRet;
    }

    async buscaAgendamento(connection,body){
        return await connection.getRepository(Agendamento)
        .createQueryBuilder("agendamento")
        .where("agendamento.cpf = :cpf", { cpf: body.cpf })
        .execute();
    }

    async updateAgendamento(connection,body){
        let jsonFiltro = {
            data:body.update.data,
            horario:body.update.horario
        }
        return await connection.createQueryBuilder()
        .update(Agendamento)
        .set(jsonFiltro)
        .where("id = :id", { id: body.id })
        .execute();
    }

    async deleteAgendamento(connection,body){
        return await connection.createQueryBuilder()
        .delete()
        .from(Agendamento)
        .where("id = :id", { id: body.id })
        .execute();
    }

    async alreadyExistAgendamento(connection,body){
        console.log(await connection.getRepository(Agendamento)
        .createQueryBuilder("agendamento")
        .where("agendamento.idAgendamento = :idagendamento", { idAgendamento: body.id })
        .andWhere("agendamento.horario = :horario", { horario: body.horario })
        .andWhere("agendamento.data = :data", { data: body.data }).getSql())

        console.log(body)
        return await connection.getRepository(Agendamento)
        .createQueryBuilder("agendamento")
        .where("agendamento.idAgendamento = :idagendamento", { idAgendamento: body.agendamentos[0].id })
        .andWhere("agendamento.horario like :horario", { horario: body.agendamentos[0].horario })
        .andWhere('data >= :data', { data: body.agendamentos[0].data })
        .andWhere('data < :data', { data: body.agendamentos[0].data })
        .getMany();;
    }
}