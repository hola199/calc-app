import { Component, OnInit } from '@angular/core';
import { TexCursor } from '../calc-class';
import { CalcService } from '../servicios/calc.service';
import { FormatearCadenasService } from '../servicios/formatear-cadenas.service';
import { TextCenterService } from '../servicios/text-center.service';
import { ResolverOperacionService } from '../servicios/resolver-operacion.service';
import { InvertirCantidadService } from '../servicios/invertir-cantidad.service';
import { TextCursorService } from '../servicios/text-cursor.service';
import { AddTextService } from '../servicios/add-text.service';
import { HistoryService } from '../servicios/history.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-calc',
  templateUrl: './calc.component.html',
  styleUrls: ['./calc.component.css']
})
export class CalcComponent implements OnInit {
  /**contendra el resultado de cada operacion */
  resultado: string;
  /**Contine el la operacion actual */
  calcText = '';
  /**contiene el texto que esta a la izquierda y derecha del cursor */
  textCursor: TexCursor = { start: '', end: '' };
  /**la cantidad que esta bajo el cursor */
  private cantidadActual = '';

  calcForm = new FormControl();

  constructor(
    public calcService: CalcService,
    public formatoService: FormatearCadenasService,
    private textCenterService: TextCenterService,
    private resolverOperacion: ResolverOperacionService,
    private invertirService: InvertirCantidadService,
    private textCursorService: TextCursorService,
    private addTextService: AddTextService,
    private historiService: HistoryService
  ) { }

  ngOnInit() {

    this.textCenterService
      .getTextCenter$()
      .subscribe(text => this.cantidadActual = text.center);

    this.textCursorService
      .getTextCursor$()
      .subscribe(text => this.textCursor = text);

    this.calcForm.valueChanges.subscribe(valor => {
      this.calcText = valor;
      this.igual();
    });

    this.addTextService.getText$().subscribe(value => {
      this.calcText = value;
    });

  }

  private igual() {
    this.calcText = this.formatoService.parentisis(this.calcText);
    this.resultado = this.resolverOperacion.resolverOperacion(this.calcText);
  }

  private invertirNumbero() {
    this.calcText = this.invertirService.invertir();
    this.addTextService.setText(this.calcText);
  }

  getTecla(tecla: string) {

    if (tecla === '=') {
      this.historiService.addHistory(this.calcText);
      this.igual();
    } else if (tecla === '+/-') {
      this.invertirNumbero();
    } else if (tecla === 'AC') {
      this.addTextService.delete();
    } else {
      this.addTextService.createText(tecla);
    }

    this.resolveOperation();
    this.setCalcTextToService();
    this.calcForm.patchValue(this.calcText);
  }


  resolveOperation() {
    this.resultado = this.resolverOperacion.resolverOperacion(this.calcText);
  }

  /** envia el texto actual a los servicios */
  setCalcTextToService() {
    this.calcService.setCalcText$(this.calcText);
  }

}
